<template>
	<div>
		<search-user-notice>
		</search-user-notice>

		<sd-autocomplete-search-input
			class="sdms-search-input"
			name="sdms-search-input"
			:label="$i18n( 'mediasearch-input-label' )"
			:initial-value="currentSearchTerm"
			:placeholder="$i18n( 'mediasearch-input-placeholder' )"
			:clear-title="$i18n( 'mediasearch-clear-title' )"
			:button-label="$i18n( 'searchbutton' )"
			:lookup-results="lookupResults"
			:lookup-disabled="lookupDisabled"
			@input="getDebouncedLookupResults"
			@submit="onUpdateTerm"
			@clear="onClear"
			@clear-lookup-results="clearLookupResults"
		>
		</sd-autocomplete-search-input>

		<!-- Generate a tab for each key in the "results" object. Data types,
		messages, and loading behavior are bound to this key. -->
		<sd-tabs :active="currentType" @tab-change="onTabChange">
			<sd-tab
				v-for="tab in tabs"
				:key="tab"
				:name="tab"
				:title="tabNames[ tab ]"
			>
				<!-- Display search filters for each tab. -->
				<search-filters :media-type="tab" @filter-change="onFilterChange">
				</search-filters>

				<did-you-mean>
				</did-you-mean>

				<div :key="'tab-content-' + tab">
					<!-- Display the available results for each tab -->
					<search-results
						:ref="tab"
						:media-type="tab"
						@load-more="resetCountAndLoadMore">
					</search-results>
				</div>

				<!-- Auto-load more results when user scrolls to the end of the list/grid,
				as long as the "autoload counter" for the tab has not reached zero -->
				<observer
					v-if="autoloadCounter[ tab ] > 0 && results[ tab ].length > 0"
					@intersect="getMoreResultsForTabIfAvailable"
				>
				</observer>
			</sd-tab>
		</sd-tabs>
	</div>
</template>

<script>
/**
 * @file App.vue
 *
 * Top-level component for the Special:MediaSearch JS UI.
 * Contains two major elements:
 * - autocomplete search input
 * - tabs to display search results (one for each media type)
 *
 * Search query and search result data lives in Vuex, but this component
 * responds to user interactions like changes in query or tab, dispatches
 * Vuex actions to make API requests, and ensures that the URL parameters
 * remain in sync with the current search term and active tab (this is done
 * using history.replaceState)
 *
 * Autocomplete lookups are handled by a mixin. When new search input is
 * emitted from the AutocompleteSearchInput, the mixin handles the lookup
 * request and this component passes an array of string lookup results to the
 * AutocompleteSearchInput for display.
 */
var MEDIASEARCH_TABS = mw.config.get( 'sdmsInitialSearchResults' ).tabs,
	mapState = require( 'vuex' ).mapState,
	mapGetters = require( 'vuex' ).mapGetters,
	mapMutations = require( 'vuex' ).mapMutations,
	mapActions = require( 'vuex' ).mapActions,
	SdAutocompleteSearchInput = require( './base/AutocompleteSearchInput.vue' ),
	SdTab = require( './base/Tab.vue' ),
	SdTabs = require( './base/Tabs.vue' ),
	SearchResults = require( './SearchResults.vue' ),
	SearchFilters = require( './SearchFilters.vue' ),
	DidYouMean = require( './DidYouMean.vue' ),
	Observer = require( './base/Observer.vue' ),
	UserNotice = require( './UserNotice.vue' ),
	autocompleteLookupHandler = require( './../mixins/autocompleteLookupHandler.js' ),
	restoreHistoryHandler = require( './../mixins/restoreHistoryHandler.js' );

// @vue/component
module.exports = {
	name: 'MediaSearch',

	components: {
		'sd-tabs': SdTabs,
		'sd-tab': SdTab,
		'sd-autocomplete-search-input': SdAutocompleteSearchInput,
		'search-results': SearchResults,
		'search-filters': SearchFilters,
		'did-you-mean': DidYouMean,
		'search-user-notice': UserNotice,
		observer: Observer
	},

	mixins: [
		autocompleteLookupHandler,
		restoreHistoryHandler
	],

	computed: $.extend( {}, mapState( [
		'autoloadCounter',
		'continue',
		'filterValues',
		'hasError',
		'pending',
		'results',
		'totalHits'
	] ), mapGetters( [
		'allActiveFilters',
		'checkForMore',
		'currentType',
		'currentSearchTerm'

	] ), {
		/**
		 * @return {string[]} [  'image', 'video', 'audio', 'page', 'other'  ]
		 */
		tabs: function () {
			return MEDIASEARCH_TABS.map( function ( tab ) {
				return tab.type;
			} );
		},

		/**
		 * @return {Object} { image: 'Images', video: 'Video', page: 'Categories and Pages'... }
		 */
		tabNames: function () {
			var names = {},
				prefix = 'mediasearch-tab-';

			// Get the i18n message for each tab title and assign to appropriate
			// key in returned object
			this.tabs.forEach(
				function ( tab ) {
					names[ tab ] = this.$i18n( prefix + tab ).text();
				}.bind( this )
			);

			return names;
		}
	} ),

	methods: $.extend( {}, mapMutations( [
		'addFilterValue',
		'clearDidYouMean',
		'decreaseAutoloadCounterForMediaType',
		'resetResults',
		'restoreContinue',
		'restoreTotalHits',
		'resetAutoLoadForAllMediaType',
		'setHasError',
		'setPending',
		'setSearchTerm',
		'updateOrDeleteQueryParam',
		'clearFilterQueryParams'
	] ), mapActions( [
		'clear',
		'syncActiveTypeAndQueryType',
		'pushQueryToHistoryState',
		'performNewSearch',
		'searchMore',
		'updateCurrentType'
	] ), {
		/**
		 * Keep UI state, URL, and history in sync as the user changes tabs
		 * Filter and sort preferences are tab-specific, so they need to be
		 * re-created every time the current tab changes.
		 *
		 * @param {string} newTabName
		 */
		onTabChange: function ( newTabName ) {
			this.updateCurrentType( newTabName );
			this.pushQueryToHistoryState();
			/* eslint-disable camelcase */
			this.$log( {
				action: 'tab_change',
				search_query: this.currentSearchTerm,
				search_media_type: this.currentType
			} );
			/* eslint-enable camelcase */
		},

		/**
		 * @param {Object} data
		 * @param {string} data.mediaType
		 * @param {string} data.filterType
		 * @param {string} [data.value]
		 */
		onFilterChange: function ( data ) {
			// the new search (with updated filter params) is handled
			// by the allActiveFilters watcher
			this.$refs[ data.mediaType ][ 0 ].hideDetails();

			this.updateOrDeleteQueryParam( { key: data.filterType, value: data.value } );
			this.pushQueryToHistoryState();
		},
		/**
		 * Keep the UI state, URL, and history in sync as the user changes
		 * search queries
		 *
		 * @param {string} newTerm
		 */
		onUpdateTerm: function ( newTerm ) {
			this.setSearchTerm( newTerm );
			this.pushQueryToHistoryState();
		},
		/**
		 * Dispatch Vuex actions to clear existing term and results whenever a
		 * "clear" event is detected. Update the URL and history as well.
		 * Also resets the autoload counter to clear any "load more" buttons
		 * that may have previously been visible in any of the tabs.
		 */
		onClear: function () {
			this.clear( this.currentType );
			this.clearLookupResults();
			this.setPending( { type: this.currentType, pending: false } );
			this.setHasError( false );

			this.resetAutoLoadForAllMediaType();

			this.$log( { action: 'search_clear' } );
		},

		/**
		 * Trigger an action to search for more result if available and log the action
		 */
		getMoreResultsForTabIfAvailable: function () {
			this.searchMore();
		},

		resetCountAndLoadMore: function () {
			this.searchMore( true );
		},

		/**
		 * Dispatch Vuex actions to clear existing results and fetch new ones.
		 * Also resets the autoload counter for all tabs for semi-infinite
		 * scroll behavior.
		 *
		 * @param {string} mediaType If provided, only reset results for this type
		 */
		onTermOrFilterChange: function ( mediaType ) {
			this.resetResults( mediaType );
			this.clearDidYouMean();
			this.resetAutoLoadForAllMediaType();

			// Clear any delayed/debounced lookup requests that may still be
			// pending once a new search is submitted, ex. if the user rapidly
			// types a result and hits enter; timeout ID is set by the
			// autocompleteLookupHandler mixin
			if ( this.debounceTimeoutId ) {
				clearTimeout( this.debounceTimeoutId );
			}

			// Abort in-flight lookup promises to ensure the results provided
			// are for the most recent search input.
			if ( this.lookupPromises ) {
				this.lookupPromises.abort();
			}

			this.performNewSearch();
		}
	} ),

	watch: {
		/**
		 * When the currentType changes, fetch more results for the new tab if
		 * available
		 *
		 * @param {string} newTab image, audio, etc.
		 * @param {string} oldTab image, audio, etc.
		 */
		currentType: function ( newTab, oldTab ) {
			if ( newTab && newTab !== oldTab ) {
				this.getMoreResultsForTabIfAvailable();
			}
		},

		/**
		 * If the new term does not match what previously existed here, perform
		 * a new search.
		 *
		 * @param {string} newTerm
		 * @param {string} oldTerm
		 */
		currentSearchTerm: function ( newTerm, oldTerm ) {
			if ( newTerm && newTerm !== oldTerm ) {
				this.onTermOrFilterChange();
			}
		},

		allActiveFilters: function ( newVal, oldVal ) {
			if ( newVal && newVal !== oldVal ) {
				this.onTermOrFilterChange( this.currentType );
			}
		}
	},

	created: function () {
		this.syncActiveTypeAndQueryType();
		// If a search term was already present when the user arrives on the page,
		// log the results of the initial server-rendered search query regardless
		// of whether any results were found
		if ( this.currentSearchTerm && this.currentType ) {
			/* eslint-disable camelcase */
			this.$log( {
				action: 'search_new',
				search_query: this.currentSearchTerm,
				search_media_type: this.currentType,
				search_result_count: this.results[ this.currentType ].length
			} );
			/* eslint-enable camelcase */
		}
	}
};
</script>
