var Vue = require( 'vue' ),
	STORAGE_KEY = require( '../constants.js' ).STORAGE_KEY;

module.exports = {

	setSearchTerm: function ( state, newTerm ) {
		Vue.set( state.uriQuery, 'search', newTerm );
	},

	clearTerm: function ( state ) {
		Vue.set( state.uriQuery, 'search', '' );
	},

	/**
	 * Set a boolean flag to indicate whether the search has errored.
	 *
	 * @param {Object} state
	 * @param {boolean} hasError
	 */
	setHasError: function ( state, hasError ) {
		state.hasError = hasError;
	},

	/**
	 * Add a search result to the given queue
	 *
	 * @param {Object} state
	 * @param {Object} payload
	 * @param {Object} payload.queue
	 * @param {Object} payload.item
	 */
	addResult: function ( state, payload ) {
		state.results[ payload.type ].push( payload.item );
	},

	/**
	 * Reset results and related data. If a payload is provided, only reset the
	 * results and related data for a specific media type; otherwise reset all
	 * results.
	 *
	 * @param {Object} state
	 * @param {string} mediaType image, audio, etc
	 */
	resetResults: function ( state, mediaType ) {
		var types = Object.keys( state.results );

		if ( mediaType ) {
			// Reset results for only a single result type if the second arg is
			// provided
			state.results[ mediaType ] = [];
			state.continue[ mediaType ] = undefined;
			state.totalHits[ mediaType ] = 0;
			state.details[ mediaType ] = null;
		} else {
			// Reset results for all types if second arg is not provided
			types.forEach( function ( type ) {
				state.results[ type ] = [];
				state.continue[ type ] = undefined;
				state.totalHits[ type ] = 0;
				state.details[ type ] = null;
			} );
		}
	},

	/**
	 * Set the continue status of a given queue (after a request has been made)
	 *
	 * @param {Object} state
	 * @param {Object} payload
	 * @param {string} payload.type
	 * @param {string|null} payload.continue
	 */
	setContinue: function ( state, payload ) {
		state.continue[ payload.type ] = payload.continue;
	},

	/**
	 * Set the pending state of a given queue to true or false
	 *
	 * @param {Object} state
	 * @param {Object} payload
	 * @param {Object} payload.type
	 * @param {boolean} payload.pending
	 */
	setPending: function ( state, payload ) {
		state.pending[ payload.type ] = payload.pending;
	},

	/**
	 * @param {Object} state
	 * @param {Object} payload
	 * @param {string} payload.mediaType
	 * @param {string} payload.totalHits
	 */
	setTotalHits: function ( state, payload ) {
		state.totalHits[ payload.mediaType ] = payload.totalHits;
	},

	setDetails: function ( state, payload ) {
		state.details[ payload.mediaType ] = payload.details;
	},

	clearDetails: function ( state, payload ) {
		state.details[ payload.mediaType ] = null;
	},

	/**
	 * Add a new filter value.
	 *
	 * @param {Object} state
	 * @param {Object} payload
	 * @param {string} payload.value The new value
	 * @param {string} payload.mediaType Which mediaType this is for
	 * @param {string} payload.filterType Which filter this is for
	 */
	addFilterValue: function ( state, payload ) {
		Vue.set( state.filterValues[ payload.mediaType ], payload.filterType, payload.value );
	},

	/**
	 * Set a new filter value.
	 *
	 * @param {Object} state
	 * @param {Object} payload
	 * @param {string} payload.mediaType Which mediaType this is for
	 * @param {string} payload.filterType Which filter this is for
	 */
	removeFilterValue: function ( state, payload ) {
		Vue.delete( state.filterValues[ payload.mediaType ], payload.filterType );
	},

	/**
	 * Reset all filters for all media types to empty values
	 *
	 * @param {Object} state
	 */
	resetFilters: function ( state ) {
		var mediaTypes = Object.keys( state.filterValues );

		mediaTypes.forEach( function ( mediaType ) {
			var activeFiltersForMediaType = Object.keys( state.filterValues[ mediaType ] );

			activeFiltersForMediaType.forEach( function ( filterType ) {
				Vue.delete( state.filterValues[ mediaType ], filterType );
			} );
		} );
	},

	/**
	 * @param {Object} state
	 * @param {string} suggestion
	 */
	setDidYouMean: function ( state, suggestion ) {
		state.didYouMean = suggestion;
	},

	/**
	 * @param {Object} state
	 */
	clearDidYouMean: function ( state ) {
		state.didYouMean = null;
	},

	/**
	 * Let the entire app know that the UI is fully initialized.
	 *
	 * Useful for things like taking measurements of DOM elements.
	 *
	 * @param {Object} state
	 */
	setInitialized: function ( state ) {
		state.initialized = true;
	},

	/**
	 * Stash the current page state into LocalStorage in case it needs to be
	 * restored later
	 *
	 * @param {Object} state
	 */
	stashPageState: function ( state ) {
		var stash = {
			results: state.results,
			continue: state.continue,
			totalHits: state.totalHits,
			filterValues: state.filterValues,
			details: state.details,
			scrollY: window.scrollY
		};

		mw.storage.setObject( STORAGE_KEY, stash );
	},

	/**
	 * Restore previously-stashed page state from LocalStorage
	 *
	 * @param {Object} state
	 */
	restorePageState: function ( state ) {
		var stash = mw.storage.getObject( STORAGE_KEY ),
			props = [ 'results', 'continue', 'totalHits', 'details', 'filterValues' ];

		// Restore previously stored state for results, continue, totalHits, and
		// details (all of which are further divided by media type)
		props.forEach( function ( prop ) {
			Object.keys( stash[ prop ] ).forEach( function ( key ) {
				state[ prop ][ key ] = stash[ prop ][ key ];
			} );
		} );

		// Restore the scroll position after a short delay
		setTimeout( function () {
			window.scroll( 0, stash.scrollY );
		}, 1500 );
	},

	/**
	 * Clear the saved data in localstorage
	 */
	clearStoredPageState: function () {
		mw.storage.remove( STORAGE_KEY );
	},
	/**
	 * Delete all filter query params from the uriQuery object but leave any
	 * other filters such as debug mode, feature flags, etc. intact.
	 *
	 * @param {Object} state
	 */
	clearFilterQueryParams: function ( state ) {
		Object.keys( state.filterValues ).forEach( function ( type ) {
			Object.keys( state.filterValues[ type ] ).forEach( function ( filter ) {
				Vue.delete( state.uriQuery, filter );
			} );
		} );
	},
	/**
	 * Update all the filters with the provided object.
	 *
	 * @param {Object} state
	 * @param {Object} currentFilterValues
	 */
	updateFilterQueryParams: function ( state, currentFilterValues ) {
		Object.keys( currentFilterValues ).forEach( function ( filter ) {
			Vue.set( state.uriQuery, filter, currentFilterValues[ filter ] );
		} );
	},

	/**
	 * Update the current type in the URI query. This will drive the active
	 * selected Tabs and all related to it.
	 *
	 * @param {Object} state
	 * @param {Object} newType
	 */
	setCurrentType: function ( state, newType ) {
		Vue.set( state.uriQuery, 'type', newType );
	},
	/**
	 * Update or delete a specific key within mw.url.query.
	 * The item will be deleted if the value is falsy
	 *
	 * @param {Object} state
	 * @param {Object} payload - Key / Value
	 */
	updateOrDeleteQueryParam: function ( state, payload ) {
		if ( payload.value ) {
			Vue.set( state.uriQuery, payload.key, payload.value );
		} else {
			Vue.delete( state.uriQuery, payload.key );
		}
	}
};
