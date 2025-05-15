const AUTOLOAD_COUNT = 2;
const STORAGE_KEY = require( '../constants.js' ).STORAGE_KEY;

module.exports = {

	setSearchTerm: function ( state, newTerm ) {
		state.uriQuery.search = newTerm;
	},

	clearTerm: function ( state ) {
		state.uriQuery.search = '';
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
		const types = Object.keys( state.results );

		if ( mediaType ) {
			// Reset results for only a single result type if the second arg is
			// provided
			state.results[ mediaType ] = [];
			state.continue[ mediaType ] = undefined;
			state.totalHits[ mediaType ] = 0;
			state.details[ mediaType ] = null;
		} else {
			// Reset results for all types if second arg is not provided
			types.forEach( ( type ) => {
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

	/**
	 * @param {Object} state
	 * @param {Object} payload
	 * @param {string} payload.mediaType
	 * @param {Object} payload.details
	 */
	setDetails: function ( state, payload ) {
		state.details[ payload.mediaType ] = payload.details;
	},

	/**
	 * @param {Object} state
	 * @param {Object} payload
	 * @param {string} payload.mediaType
	 */
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
		state.filterValues[ payload.mediaType ][ payload.filterType ] = payload.value;
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
		delete state.filterValues[ payload.mediaType ][ payload.filterType ];
	},

	/**
	 * Reset all filters for all media types to empty values
	 *
	 * @param {Object} state
	 */
	resetFilters: function ( state ) {
		const mediaTypes = Object.keys( state.filterValues );

		mediaTypes.forEach( ( mediaType ) => {
			const activeFiltersForMediaType = Object.keys( state.filterValues[ mediaType ] );

			activeFiltersForMediaType.forEach( ( filterType ) => {
				delete state.filterValues[ mediaType ][ filterType ];
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
	 * @param {Object} state
	 * @param {string} searchWarnings
	 */
	setSearchWarnings: function ( state, searchWarnings ) {
		state.searchWarnings = searchWarnings;
	},

	/**
	 * @param {Object} state
	 */
	clearSearchWarnings: function ( state ) {
		state.searchWarnings = null;
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
		const stash = {
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
		const stash = mw.storage.getObject( STORAGE_KEY ),
			props = [ 'results', 'continue', 'totalHits', 'details', 'filterValues' ];

		// Restore previously stored state for results, continue, totalHits, and
		// details (all of which are further divided by media type)
		props.forEach( ( prop ) => {
			Object.keys( stash[ prop ] ).forEach( ( key ) => {
				state[ prop ][ key ] = stash[ prop ][ key ];
			} );
		} );

		// Restore the scroll position after a short delay
		setTimeout( () => {
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
		Object.keys( state.filterValues ).forEach( ( type ) => {
			Object.keys( state.filterValues[ type ] ).forEach( ( filter ) => {
				delete state.uriQuery[ filter ];
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
		Object.keys( currentFilterValues ).forEach( ( filter ) => {
			state.uriQuery[ filter ] = currentFilterValues[ filter ];
		} );
	},

	/**
	 * Update the current type in the URI query. This will drive the active
	 * selected Tabs and all related to it. if the type is not in the list of
	 * available types, it will be added.
	 *
	 * @param {Object} state
	 * @param {Object} newType
	 */
	setCurrentType: function ( state, newType ) {
		const allowedTypes = Object.keys( state.results );

		if ( allowedTypes.indexOf( newType ) !== -1 ) {
			state.uriQuery.type = newType;
		}
	},
	/**
	 * Update or delete a specific key within uriQuery.
	 * The item will be deleted if the value is falsy
	 *
	 * @param {Object} state
	 * @param {Object} payload
	 * @param {string} payload.key
	 * @param {string} payload.value
	 */
	updateOrDeleteQueryParam: function ( state, payload ) {
		if ( payload.value ) {
			state.uriQuery[ payload.key ] = payload.value;
		} else {
			delete state.uriQuery[ payload.key ];
		}
	},
	/**
	 * Reset the object containing the number of autoload for each MediaType
	 * to the static value of AUTOLOAD_COUNT
	 *
	 * @param {Object} state
	 */
	resetAutoLoadForAllMediaType: function ( state ) {
		Object.keys( state.autoloadCounter ).forEach( ( mediaType ) => {
			state.autoloadCounter[ mediaType ] = AUTOLOAD_COUNT;
		} );
	},
	/**
	 * Reset the number of autoload for a specific MediaType
	 * to the static value of AUTOLOAD_COUNT
	 *
	 * @param {Object} state
	 * @param {string} mediaType
	 */
	resetAutoLoadForMediaType: function ( state, mediaType ) {
		state.autoloadCounter[ mediaType ] = AUTOLOAD_COUNT;
	},
	/**
	 * Decrease the number of autoload for a specific MediaType by 1
	 *
	 * @param {Object} state
	 * @param {string} mediaType
	 */
	decreaseAutoloadCounterForMediaType: function ( state, mediaType ) {
		const currentValue = state.autoloadCounter[ mediaType ];
		if ( currentValue >= 1 ) {
			state.autoloadCounter[ mediaType ] = currentValue - 1;
		}
	}
};
