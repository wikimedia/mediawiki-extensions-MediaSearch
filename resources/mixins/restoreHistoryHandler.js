/**
 * @file restoreHistoryHandler.js
 *
 *
 * Mixins used to set up a listener for popState and popHide events in case the user navigates
 * through their history stack.
 */
const STORAGE_KEY = require( '../constants.js' ).STORAGE_KEY;
const searchOptions = require( '../data/searchOptions.json' ); // Virtual file generated by SearchOptions.php
const { mapMutations, mapActions } = require( 'vuex' );

module.exports = exports = {
	methods: Object.assign( {}, mapMutations( [
		'clearStoredPageState',
		'clearFilterQueryParams',
		'resetFilters',
		'resetResults',
		'addFilterValue',
		'setSearchTerm',
		'stashPageState',
		'restorePageState',
		'updateOrDeleteQueryParam'
	] ), mapActions( [
		'search',
		'clear',
		'updateCurrentType',
		'replaceQueryToHistoryState'
	] ), {

		/**
		 * @param {PopStateEvent} e
		 * @param {Object} [ e.state ]
		 */
		onPopState: function ( e ) {
			// If the newly-active history entry includes a state object, use it
			// to reset the URL query params and the UI state

			if ( e.state && e.state.type ) {
				this.setSearchTerm( e.state.search || '' );
				this.updateCurrentType( e.state.type );

				// if the newly-active history entry includes a "null" query
				// (the result of clicking the clear button, for example),
				// ensure that the results are reset
				if ( this.currentSearchTerm === '' ) {
					this.resetResults();
					this.clearLookupResults();
				}

				// Retrieve any previously-active filters from the state object
				// and manipulate the current state of both the application and
				// the URL object to match the previously-stored values
				this.clearFilterQueryParams();
				this.resetFilters();
				Object.keys( e.state ).forEach( ( key ) => {
					if (
						searchOptions[ this.currentType ] &&
						key in searchOptions[ this.currentType ]
					) {
						this.updateOrDeleteQueryParam( { key: key, value: e.state[ key ] } );
						this.addFilterValue( {
							mediaType: this.currentType,
							filterType: key,
							value: e.state[ key ]
						} );
					}
				} );
			}
		},

		/**
		 * If necessary, stash page state into localstorage to restore in the
		 * case of back navigation later
		 *
		 * @param {Event} event
		 */
		onPageHide: function ( event ) {
			if ( event.persisted ) {
				this.clearStoredPageState();
			} else {
				this.stashPageState();
			}
		},

		/**
		 * Determine of the UI state should be restored the previous session;
		 * Some modern browsers can do this automatically so we should only
		 * handle this ourselves if necessary.
		 */
		restorePageStateIfNecessary: function () {
			const perf = window.performance;
			let isBackNavigating = false,
				hasStashedData = false,
				navigationEntry;

			if ( perf && perf.getEntriesByType ) {
				navigationEntry = perf.getEntriesByType( 'navigation' )[ 0 ];
			}

			// Determine whether the user arrived via back navigation using the
			// new window.performance API if supported, falling back to the
			// deprecated API if not
			isBackNavigating = navigationEntry ?
				( navigationEntry.type === 'back_forward' ) :
				( perf.navigation.type === 2 );

			// Determine if we have stashed data in localstorage from a previous session
			hasStashedData = !!mw.storage.getObject( STORAGE_KEY );

			if ( isBackNavigating && hasStashedData ) {
				this.restorePageState();
			}

			// Clear any previously stashed data; at this point we
			// have either already used it or did not need it
			this.clearStoredPageState();
		}
	} ),

	created: function () {

		this.boundOnPopState = this.onPopState.bind( this );
		this.boundOnPageHide = this.onPageHide.bind( this );

		// Set up the event listeners
		window.addEventListener( 'popstate', this.boundOnPopState );
		window.addEventListener( 'pagehide', this.boundOnPageHide );

	},

	mounted: function () {
		// Record whatever the initial query params are that the user arrived on
		// the page with as "state" in the history stack using history.replaceState;
		// this will enable us to access it later if the user starts navigating
		// through history states
		this.replaceQueryToHistoryState();
		// Restore the user's previous session from localstorage if necessary
		this.restorePageStateIfNecessary();
	},

	beforeUnmount: function () {
		window.removeEventListener( 'popstate', this.boundOnPopState );
	}
};
