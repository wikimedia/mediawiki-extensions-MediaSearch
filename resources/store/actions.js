const getLocationAgnosticMwApi = require( '../getLocationAgnosticMwApi.js' );
const externalSearchUri = mw.config.get( 'sdmsExternalSearchUri' );
const LIMIT = 40;
const mwUri = new mw.Uri();
const searchOptions = require( '../data/searchOptions.json' );
let activeSearchRequest = null;

/**
 * Generate additional (non-term) search keywords for filters.
 *
 * @param {string} mediaType
 * @param {Object} filterValues Filter values for this media type
 * @return {string}
 */
const getMediaFilters = function ( mediaType, filterValues ) {
	let raw;

	// Start with a filter based on media type(s).
	switch ( mediaType ) {
		case 'image':
			raw = 'filetype:bitmap|drawing';
			break;

		case 'other':
			raw = 'filetype:multimedia|office|archive|3d';
			break;

		default:
			raw = 'filetype:' + mediaType;
			break;
	}

	function addFilter( filter ) {
		const value = filter in filterValues ? filterValues[ filter ] : null;
		if ( value && filter !== 'assessment' ) {
			return ' ' + filter + ':' + value;
		}

		return '';
	}

	// We need to filter out media result with 0 width and height
	if ( mediaType !== 'audio' ) {
		raw += ' -fileres:0';
	}

	raw += addFilter( 'filemime' );
	raw += addFilter( 'fileres' );
	raw += addFilter( 'assessment' );
	raw += addFilter( 'haslicense' );

	return raw;
};

/**
 * @param {string} suggestion suggested search term pre-pended with active search keywords
 * @param {string|undefined} filters ex: filetype:bitmap|drawing filemime:png
 * @param {string|undefined} assessment ex: haswbstatement:P6731=Q63348049
 * @return {string} string containing *only* the suggested new query, no keywords
 */
const extractSuggestedTerm = function ( suggestion, filters, assessment ) {
	let filteredSuggestion = suggestion;

	if ( filters ) {
		filteredSuggestion = filteredSuggestion.slice( filters.length ).trim();
	}

	if ( assessment ) {
		filteredSuggestion = filteredSuggestion.replace( assessment, '' ).trim();
	}

	return filteredSuggestion;
};

/**
 * Perform a search via API request. Should return a promise.
 * There are a few different ways that searches should behave.
 * This search will use the current term and type
 *
 * - If a totally new search term has been provided, blow away existing
 *   results for all tabs but only fetch new results for whatever tab is
 *   currently active
 * - If the user switches to a tab where results have not yet been loaded
 *   but the search term is still good, fetch results for the active tab
 *   and add them, but leave other results alone
 * - Certain actions like scrolling will load more results within a given
 *   queue if they are available. In this case the term and the media-type
 *   will not change, but the "continue" state will, and new results will
 *   be added to the current tab only
 *
 * @param {Object} context
 * @param {boolean} forceSearch
 * @return {jQuery.Deferred}
 */
const searchCurrentTermAndType = function ( context ) {

	// Don't make API requests if the search term is empty or is in error
	if ( context.getters.currentSearchTerm === '' ) {
		return $.Deferred().resolve().promise( { abort: function () {} } );
	}

	// common request params for all requests
	const params = {
			format: 'json',
			uselang: mw.config.get( 'wgUserLanguage' ),
			action: 'query',
			generator: 'search',
			gsrsearch: context.getters.currentSearchTerm,
			gsrlimit: LIMIT,
			gsroffset: context.state.continue[ context.getters.currentType ] || 0,
			gsrinfo: 'totalhits|suggestion',
			gsrprop: 'size|wordcount|timestamp|snippet',
			prop: context.getters.currentType === 'page' ? 'info|categoryinfo' : 'info|imageinfo|entityterms',
			inprop: 'url'
		},
		namespaceGroups = mw.config.get( 'sdmsNamespaceGroups' ),
		filterValues = context.state.filterValues[ context.getters.currentType ] || {};

	let filters, statement;

	// If a search request is already in-flight, abort it
	if ( activeSearchRequest && activeSearchRequest.abort ) {
		activeSearchRequest.abort();
	}

	if ( context.state.continue[ context.getters.currentType ] === null ) {
		// prevent API requests when they're already known not to have results
		// (because there was no continuation offset)
		activeSearchRequest = $.Deferred().resolve().promise( { abort: function () {} } );
		return activeSearchRequest;
	}

	if ( context.getters.currentType === 'page' ) {
		// Page/category-specific params.
		const namespaceFilter = filterValues.namespace;

		// Default to all namespaces.
		let namespaces = Object.keys( namespaceGroups.all ).join( '|' );

		if ( namespaceFilter ) {
			// If the namespace filter value is one of the pre-defined
			// namespace groups, get the list of values from the namespace
			// group data. Otherwise, we're getting a custom list of
			// namespaces - use that.
			namespaces = namespaceFilter in namespaceGroups ?
				Object.keys( namespaceGroups[ namespaceFilter ] ).join( '|' ) :
				namespaceFilter;
		}
		params.gsrnamespace = namespaces;
	} else {
		// Params used in all non-page/category searches.
		// 1. Special handling for assessment filter
		if ( filterValues.assessment ) {
			const assessmentValue = filterValues.assessment;
			const assessmentStatements = searchOptions[ context.getters.currentType ]
				.assessment.data.statementData;

			const assessment = assessmentStatements.find( ( i ) => i.value === assessmentValue );

			if ( assessment ) {
				statement = assessment.statement;
				params.gsrsearch = statement + ' ' + params.gsrsearch;
			}
		}
		// 2. Handle remaining filters
		filters = getMediaFilters( context.getters.currentType, filterValues );
		if ( filters ) {
			params.gsrsearch = filters + ' ' + params.gsrsearch;
		}
		let urlWidth;
		switch ( context.getters.currentType ) {
			case 'video':
				urlWidth = 200;
				break;

			case 'other':
				// generating thumbnails from many of these file types is very
				// expensive and slow, enough so that we're better off using a
				// larger (takes longer to transfer) pre-generated (but readily
				// available) size
				urlWidth = Math.min.apply( Math, mw.config.get( 'sdmsThumbRenderMap' ) );
				break;
		}

		params.gsrnamespace = 6; // NS_FILE
		params.iiprop = 'url|size|mime';
		params.iiurlheight = context.getters.currentType === 'image' ? 180 : undefined;
		params.iiurlwidth = urlWidth;
		params.wbetterms = 'label';
	}

	// if there are query params prefixed with mediasearch_, then also
	// pass them on to the API search request - this allows requesting
	// a specific search profile and carry it forward in JS navigation
	Object.keys( context.state.uriQuery )
		.filter( ( param ) => param.match( /^mediasearch_/ ) )
		.forEach( ( param ) => {
			params[ param ] = context.state.uriQuery[ param ];
		} );

	// Add sort filter.
	if ( 'sort' in filterValues &&
		filterValues.sort === 'recency' ) {
		params.gsrsort = 'create_timestamp_desc';
	}

	// Reset current error state
	context.commit( 'setHasError', false );

	// Set the pending state for the given queue
	context.commit( 'setPending', {
		type: context.getters.currentType,
		pending: true
	} );

	const request = getLocationAgnosticMwApi( externalSearchUri, { anonymous: true } ).get( params );

	request.promise( {
		abort: function () {
			request.abort();
		}
	} );

	activeSearchRequest = request;

	return request.then( ( response ) => {
		const existingTitles = context.state.results[ context.getters.currentType ].map( ( result ) => result.title );

		if ( response.query && response.query.pages ) {
			const results = response.query.pages;
			const titles = Object.keys( results );

			// Sort the results within each batch prior to committing them
			// to the store. Also, ensure that there is no duplication of
			// results between batches (see https://phabricator.wikimedia.org/T272923);
			// if a new result's title already exists in the set of
			// previously-loaded results, filter it out.
			const sortedResults = titles
				.map( ( id ) => results[ id ] )
				.filter( ( result ) => existingTitles.indexOf( result.title ) < 0 )
				.sort( ( a, b ) => a.index - b.index );

			sortedResults.forEach( ( result ) => {
				context.commit( 'addResult', { type: context.getters.currentType, item: result } );
			} );

			if ( response.query.searchinfo && response.query.searchinfo.totalhits ) {
				context.commit( 'setTotalHits', {
					mediaType: context.getters.currentType,
					totalHits: response.query.searchinfo.totalhits
				} );
			}
		}

		if ( response.query && response.query.searchinfo && response.query.searchinfo.suggestion ) {
			context.commit( 'setDidYouMean',
				extractSuggestedTerm( response.query.searchinfo.suggestion, filters, statement )
			);
		}

		if ( response.warnings && response.warnings.search && response.warnings.search[ '*' ] ) {
			context.commit( 'setSearchWarnings', response.warnings.search[ '*' ] );
		}

		// Set whether or not the query can be continued
		if ( response.continue && response.continue.gsroffset ) {
			// Store the "continue" property of the request so we can pick up where we left off
			context.commit( 'setContinue', {
				type: context.getters.currentType,
				continue: response.continue.gsroffset
			} );
		} else {
			context.commit( 'setContinue', {
				type: context.getters.currentType,
				continue: null
			} );
		}
	} ).done( () => {
		// Set pending back to false when request is complete
		activeSearchRequest = null;
		context.commit( 'setPending', { type: context.getters.currentType, pending: false } );
	} ).catch( ( errorCode, details ) => {
		// Set pending to false and clear the stashed request
		let pendingType;
		activeSearchRequest = null;

		Object.keys( context.state.pending ).forEach( ( type ) => {
			if ( context.state.pending[ type ] === true && context.getters.currentType !== type ) {
				pendingType = type;
			}
		} );

		if ( pendingType ) {
			context.commit( 'setPending', { type: pendingType, pending: false } );
		}

		// No other error handling is required if the request has been
		// aborted by the client
		if ( details && details.textStatus === 'abort' ) {
			return;
		}

		// In the case of a real failure, throw the error back to the App
		// component to display a suitable message to the user
		context.commit( 'setHasError', true );
		throw details;
	} );
};

// We record timing here in the store, instead of in App.vue like other use
// cases, so we can ensure we are only timing full search requests that make it
// to the backend. Sadly this still times some things that end up
// short-circuiting and skipping the backend, but refactoring the 200 line
// function above is left as an excercise for the future.
const timedPromise = function ( metricName, fn, ...args ) {
	const start = performance.now();
	const promise = fn.apply( this, args );

	promise.done( () => {
		const took = performance.now() - start;
		// half-hearted attempt to skip requests that didn't query the backend, we know
		// that anything that touches the mw api and gets a non-cached response takes
		// at least 10ms. Optimistically the short-circuit attempts above should happen
		// in a single tick.
		if ( took >= 10 ) {
			mw.track( 'timing.MediaSearch' + metricName, took );
		}
	} );

	return promise;
};

module.exports = {

	/**
	 * Force a new search overriding any current pending request and
	 * resetting current autoloadcounter for the searched term
	 *
	 * @param {Object} context
	 * @return {jQuery.Deferred}
	 */
	performNewSearch: function ( context ) {
		return timedPromise( 'NewSearch', searchCurrentTermAndType, context );
	},
	/**
	 * Continue to search the current term and type. This will just trigger a search
	 * if there are more values available and if the autoloadcounter is not 0.
	 *
	 * @param {Object} context
	 * @param {boolean} resetCounter
	 * @return {jQuery.Deferred}
	 */
	searchMore: function ( context, resetCounter ) {

		if ( resetCounter ) {
			context.commit( 'resetAutoLoadForMediaType', context.getters.currentType );
		}

		if (
			!context.getters.checkForMore[ context.getters.currentType ] ||
			context.state.autoloadCounter[ context.getters.currentType ] === 0 ||
			context.state.hasError ) {
			return $.Deferred().resolve().promise();
		}

		if ( !context.state.pending[ context.getters.currentType ] ) {
			// If more results are available, and if another request is not
			// already pending, then launch a search request
			return timedPromise( 'SearchMore', searchCurrentTermAndType, context )
				.then( function ( decreaseAutoload ) {
					if ( !decreaseAutoload ) {
						this.commit( 'decreaseAutoloadCounterForMediaType', this.getters.currentType );
					}
				}.bind( this, resetCounter ) );

		} else {
			// If more results are available but another request is
			// currently in-flight, attempt to make the request again
			// after some time has passed
			const deferred = $.Deferred();
			window.setTimeout(
				() => {
					context.dispatch( 'searchMore' )
						.then( deferred.resolve, deferred.reject );
				},
				2000
			);
			return deferred.promise();
		}
	},

	/**
	 * Fetch expanded details for a given search result by title
	 *
	 * @param {Object} context
	 * @param {Object} options
	 * @param {string} options.mediaType
	 * @param {string} options.title
	 * @return {jQuery.Deferred}
	 */
	fetchDetails: function ( context, options ) {
		const userLanguage = mw.config.get( 'wgUserLanguage' ),
			params = {
				format: 'json',
				uselang: userLanguage,
				action: 'query',
				inprop: 'url',
				titles: options.title,
				iiextmetadatalanguage: userLanguage
			};

		// Set special params for audio/video files
		if ( options.mediaType === 'video' || options.mediaType === 'audio' ) {
			params.prop = 'info|videoinfo|entityterms';
			params.viprop = 'url|size|mime|extmetadata|derivatives';
			params.viurlwidth = 640;
		} else {
			params.prop = 'info|imageinfo|entityterms';
			params.iiprop = 'url|size|mime|extmetadata';
			params.iiurlheight = options.mediaType === 'image' ? 180 : undefined;
		}

		return getLocationAgnosticMwApi( externalSearchUri, { anonymous: true } ).get( params );
	},

	/**
	 * Handle search term clear.
	 *
	 * @param {Object} context
	 */
	clear: function ( context ) {
		if ( activeSearchRequest ) {
			activeSearchRequest.abort();
			activeSearchRequest = null;
		}

		context.commit( 'clearFilterQueryParams' );
		context.commit( 'clearTerm' );
		context.commit( 'resetFilters' );
		context.commit( 'resetResults' );
		context.commit( 'clearDidYouMean' );
		context.commit( 'clearSearchWarnings' );
		context.dispatch( 'pushQueryToHistoryState' );
	},

	/**
	 * @param {Object} context
	 */
	ready: function ( context ) {
		context.commit( 'setInitialized' );
	},

	/**
	 * Update "Switch to Special:Search" link target
	 *
	 * @param {Object} context
	 */
	updateSpecialSearch: function ( context ) {
		const specialSearch = document.getElementById( 'mediasearch-switch-special-search' );
		if ( !specialSearch ) {
			return;
		}
		const uri = new mw.Uri( specialSearch.href );
		uri.extend( { search: context.state.uriQuery.search } );
		specialSearch.href = uri;
	},
	/**
	 * Push the current value of url.query to the browser's session history stack
	 *
	 * @param {Object} context
	 */
	pushQueryToHistoryState: function ( context ) {
		// update mw URI query object with the one currently available within the store
		// In Vue 3, context.state.uriQuery is a Proxy, and passing it to replaceState()
		// causes an error saying it can't be cloned. Work around this by cloning the uriQuery
		// object ourselves, using JSON.parse( JSON.stringify() ) to convert the Proxy to Object.
		mwUri.query = JSON.parse( JSON.stringify( context.state.uriQuery ) );
		const queryString = '?' + mwUri.getQueryString();
		window.history.pushState( mwUri.query, null, queryString );
		context.dispatch( 'updateSpecialSearch' );
	},
	/**
	 * Replace the current value of url.query to the browser's session history stack
	 *
	 * @param {Object} context
	 */
	replaceQueryToHistoryState: function ( context ) {
		// update mw URI query object with the one currently available within the store
		// In Vue 3, context.state.uriQuery is a Proxy, and passing it to replaceState()
		// causes an error saying it can't be cloned. Work around this by cloning the uriQuery
		// object ourselves, using JSON.parse( JSON.stringify() ) to convert the Proxy to Object.
		mwUri.query = JSON.parse( JSON.stringify( context.state.uriQuery ) );
		const queryString = '?' + mwUri.getQueryString();
		window.history.replaceState( mwUri.query, null, queryString );
		context.dispatch( 'updateSpecialSearch' );
	},
	/**
	 * Update the current Type value and reset all filters
	 *
	 * @param {Object} context
	 * @param {string} currentType
	 */
	updateCurrentType: function ( context, currentType ) {
		if ( context.getters.currentType === currentType ) {
			return;
		}
		context.commit( 'clearFilterQueryParams' );
		context.commit( 'setCurrentType', currentType );
		context.commit( 'updateFilterQueryParams', context.state.filterValues[ currentType ] );
	},
	/**
	 * Clean query paramethers and update the history state
	 *
	 * @param {Object} context
	 */
	clearQueryParams: function ( context ) {
		context.commit( 'clearTerm' );
		context.commit( 'clearFilterQueryParams' );
		context.dispatch( 'pushQueryToHistoryState' );
	},
	/**
	 * Align mw active type with query parameter one. This is to make sure we
	 * align the UI with the value received from the PHP side
	 *
	 * @param {Object} context
	 */
	syncActiveTypeAndQueryType: function ( context ) {
		const activeType = mw.config.get( 'sdmsInitialSearchResults' ).activeType;

		if ( context.state.uriQuery.type !== activeType ) {
			context.commit( 'setCurrentType', activeType );
		}
	}
};
