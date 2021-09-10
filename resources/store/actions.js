'use strict';

var getLocationAgnosticMwApi = require( '../getLocationAgnosticMwApi.js' ),
	externalSearchUri = mw.config.get( 'sdmsExternalSearchUri' ),
	LIMIT = 40,
	activeSearchRequest = null,
	uri = new mw.Uri(),
	searchOptions = require( '../data/searchOptions.json' );

/**
 * Generate additional (non-term) search keywords for filters.
 *
 * @param {string} mediaType
 * @param {Object} filterValues Filter values for this media type
 * @return {string}
 */
function getMediaFilters( mediaType, filterValues ) {
	var raw;

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
		var value = filter in filterValues ? filterValues[ filter ] : null;
		if ( value && filter !== 'assessment' ) {
			return ' ' + filter + ':' + value;
		}

		return '';
	}

	raw += addFilter( 'filemime' );
	raw += addFilter( 'fileres' );
	raw += addFilter( 'assessment' );
	raw += addFilter( 'haslicense' );

	return raw;
}

/**
 * @param {string} suggestion
 * @param {string} filters
 * @return {string}
 */
function extractSuggestedTerm( suggestion, filters, assessment ) {
	var filteredSuggestion = suggestion;

	if ( filters ) {
		filteredSuggestion = filteredSuggestion.substring( filters.length ).trim();
	}

	if ( assessment ) {
		filteredSuggestion = filteredSuggestion.replace( assessment, '' ).trim();
	}

	return filteredSuggestion;
}

module.exports = {
	/**
	 * Perform a search via API request. Should return a promise.
	 * There are a few different ways that searches should behave.
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
	 * @param {Object} options
	 * @param {string} options.type image / page / audio / video / other
	 * @param {string} options.term search term
	 * @return {jQuery.Deferred}
	 */
	search: function ( context, options ) {
		// common request params for all requests
		var params = {
				format: 'json',
				uselang: mw.config.get( 'wgUserLanguage' ),
				action: 'query',
				generator: 'search',
				gsrsearch: options.term,
				gsrlimit: LIMIT,
				gsroffset: context.state.continue[ options.type ] || 0,
				gsrinfo: 'totalhits|suggestion',
				gsrprop: 'size|wordcount|timestamp|snippet',
				prop: options.type === 'page' ? 'info|categoryinfo' : 'info|imageinfo|entityterms',
				inprop: 'url'
			},
			namespaceGroups = mw.config.get( 'sdmsNamespaceGroups' ),
			namespaceFilter,
			namespaces,
			filters,
			urlWidth,
			request,
			statement,
			filterValues = context.state.filterValues[ options.type ] || {};

		// If a search request is already in-flight, abort it
		if ( activeSearchRequest && activeSearchRequest.abort ) {
			activeSearchRequest.abort();
		}

		if ( context.state.continue[ options.type ] === null ) {
			// prevent API requests when they're already known not to have results
			// (because there was no continuation offset)
			activeSearchRequest = $.Deferred().resolve().promise( { abort: function () {} } );
			return activeSearchRequest;
		}

		if ( options.type === 'page' ) {
			// Page/category-specific params.
			namespaceFilter = filterValues.namespace;

			// Default to all namespaces.
			namespaces = Object.keys( namespaceGroups.all ).join( '|' );

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
				var assessmentValue = filterValues.assessment;
				var assessmentStatements = searchOptions[ options.type ].assessment.data.statementData;

				// eslint-disable-next-line no-restricted-syntax
				var assessment = assessmentStatements.find( function ( i ) {
					return i.value === assessmentValue;
				} );

				if ( assessment ) {
					statement = assessment.statement;
					params.gsrsearch = statement + ' ' + params.gsrsearch;
				}
			}
			// 2. Handle remaining filters
			filters = getMediaFilters( options.type, filterValues );
			if ( filters ) {
				params.gsrsearch = filters + ' ' + params.gsrsearch;
			}
			switch ( options.type ) {
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
			params.iiurlheight = options.type === 'image' ? 180 : undefined;
			params.iiurlwidth = urlWidth;
			params.wbetterms = 'label';
		}

		// if there are query params prefixed with mediasearch_, then also
		// pass them on to the API search request - this allows requesting
		// a specific search profile and carry it forward in JS navigation
		Object.keys( uri.query )
			.filter( function ( param ) {
				return param.match( /^mediasearch_/ );
			} )
			.forEach( function ( param ) {
				params[ param ] = uri.query[ param ];
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
			type: options.type,
			pending: true
		} );

		request = getLocationAgnosticMwApi( externalSearchUri, { anonymous: true } ).get( params );

		request.promise( {
			abort: function () {
				request.abort();
			}
		} );

		activeSearchRequest = request;

		return request.then( function ( response ) {
			var existingPageIds = context.state.results[ options.type ].map( function ( result ) {
					return result.pageid;
				} ),
				results, pageIDs, sortedResults;

			if ( response.query && response.query.pages ) {
				results = response.query.pages;
				pageIDs = Object.keys( results );

				// Sort the results within each batch prior to committing them
				// to the store. Also, ensure that there is no duplication of
				// results between batches (see https://phabricator.wikimedia.org/T272923);
				// if a new result's pageId already exists in the set of
				// previously-loaded results, filter it out.
				sortedResults = pageIDs
					.map( function ( id ) { return results[ id ]; } )
					.filter( function ( result ) { return existingPageIds.indexOf( result.pageid ) < 0; } )
					.sort( function ( a, b ) { return a.index - b.index; } );

				sortedResults.forEach( function ( result ) {
					context.commit( 'addResult', { type: options.type, item: result } );
				} );

				if ( response.query.searchinfo && response.query.searchinfo.totalhits ) {
					context.commit( 'setTotalHits', {
						mediaType: options.type,
						totalHits: response.query.searchinfo.totalhits
					} );
				}
			}

			if ( response.query && response.query.searchinfo && response.query.searchinfo.suggestion ) {
				context.commit( 'setDidYouMean',
					extractSuggestedTerm( response.query.searchinfo.suggestion, filters, statement )
				);
			}

			// Set whether or not the query can be continued
			if ( response.continue && response.continue.gsroffset ) {
				// Store the "continue" property of the request so we can pick up where we left off
				context.commit( 'setContinue', { type: options.type, continue: response.continue.gsroffset } );
			} else {
				context.commit( 'setContinue', { type: options.type, continue: null } );
			}
		} ).done( function () {
			// Set pending back to false when request is complete
			activeSearchRequest = null;
			context.commit( 'setPending', { type: options.type, pending: false } );
		} ).catch( function ( errorCode, details ) {
			// Set pending to false and clear the stashed request
			activeSearchRequest = null;
			context.commit( 'setPending', { type: options.type, pending: false } );

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
	},

	/**
	 * Fetch expanded details for a given search result by pageId
	 *
	 * @param {Object} context
	 * @param {Object} options
	 * @param {string} options.mediaType
	 * @param {number} options.pageId
	 * @return {jQuery.Deferred}
	 */
	fetchDetails: function ( context, options ) {
		var userLanguage = mw.config.get( 'wgUserLanguage' ),
			params = {
				format: 'json',
				uselang: userLanguage,
				action: 'query',
				inprop: 'url',
				pageids: options.pageId,
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

		context.commit( 'clearTerm' );
		context.commit( 'resetFilters' );
		context.commit( 'resetResults' );
		context.commit( 'clearDidYouMean' );
	},

	/**
	 * @param {Object} context
	 */
	ready: function ( context ) {
		context.commit( 'setInitialized' );
	}
};
