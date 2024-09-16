<template>
	<div>
		<search-user-notice>
		</search-user-notice>

		<sd-autocomplete-search-input
			class="sdms-search-input"
			name="sdms-search-input"
			:label="$i18n( 'mediasearch-input-label' ).text()"
			:initial-value="currentSearchTerm"
			:placeholder="$i18n( 'mediasearch-input-placeholder' ).text()"
			:button-label="$i18n( 'searchbutton' ).text()"
			:initialized="initialized"
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
		<cdx-tabs :active="currentType" @update:active="onTabChange">
			<cdx-tab
				v-for="tab in tabs"
				:key="tab"
				:name="tab"
				:label="tabNames[ tab ]"
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
			</cdx-tab>
		</cdx-tabs>
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
const MEDIASEARCH_TABS = mw.config.get( 'sdmsInitialSearchResults' ).tabs,
	mapState = require( 'vuex' ).mapState,
	mapGetters = require( 'vuex' ).mapGetters,
	mapMutations = require( 'vuex' ).mapMutations,
	mapActions = require( 'vuex' ).mapActions,
	SdAutocompleteSearchInput = require( './base/AutocompleteSearchInput.vue' ),
	SearchResults = require( './SearchResults.vue' ),
	SearchFilters = require( './SearchFilters.vue' ),
	DidYouMean = require( './DidYouMean.vue' ),
	Observer = require( './base/Observer.vue' ),
	UserNotice = require( './UserNotice.vue' ),
	autocompleteLookupHandler = require( './../mixins/autocompleteLookupHandler.js' ),
	restoreHistoryHandler = require( './../mixins/restoreHistoryHandler.js' );

const { CdxTabs, CdxTab } = require( '@wikimedia/codex' );

// @vue/component
module.exports = exports = {
	name: 'MediaSearch',

	components: {
		CdxTabs,
		CdxTab,
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

	// The App.vue file contains no local state. An empty object is returned as
	// a placeholder for ease of unit-testing. When the time comes to migrate
	// the MediaSearch front-end to Vue 3, this file could be re-written using
	// the composition API or even <script setup> to eliminate this redundant
	// option.
	data: function () {
		return {};
	},

	computed: Object.assign( {}, mapState( [
		'autoloadCounter',
		'results',
		'initialized'
	] ), mapGetters( [
		'allActiveFilters',
		'currentType',
		'currentSearchTerm'

	] ), {
		/**
		 * @return {string[]} [  'image', 'video', 'audio', 'page', 'other'  ]
		 */
		tabs: function () {
			return MEDIASEARCH_TABS.map( ( tab ) => tab.type );
		},

		/**
		 * @return {Object} { image: 'Images', video: 'Video', page: 'Categories and Pages'... }
		 */
		tabNames: function () {
			const names = {},
				prefix = 'mediasearch-tab-';

			// Get the i18n message for each tab title and assign to appropriate
			// key in returned object
			this.tabs.forEach(
				( tab ) => {
					// Messages that can be used here:
					// * mediasearch-tab-image
					// * mediasearch-tab-audio
					// * mediasearch-tab-video
					// * mediasearch-tab-page
					// * mediasearch-tab-other
					names[ tab ] = this.$i18n( prefix + tab ).text();
				}
			);

			return names;
		}
	} ),

	methods: Object.assign( {}, mapMutations( [
		'clearDidYouMean',
		'resetResults',
		'resetAutoLoadForAllMediaType',
		'setHasError',
		'setPending',
		'setSearchTerm',
		'updateOrDeleteQueryParam'
	] ), mapActions( [
		'clear',
		'syncActiveTypeAndQueryType',
		'pushQueryToHistoryState',
		'performNewSearch',
		'searchMore',
		'updateCurrentType',
		'ready'
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
			// VUE 3 MIGRATION: these refs are arrays in Vue 2 but not in Vue 3
			( this.$refs[ data.mediaType ][ 0 ] || this.$refs[ data.mediaType ] ).hideDetails();

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
			this.searchMore().then( () => {
				/* eslint-disable camelcase */
				this.$log( {
					action: 'search_load_more',
					search_query: this.currentSearchTerm,
					search_media_type: this.currentType,
					search_result_count: this.results[ this.currentType ].length
				} );
				/* eslint-enable camelcase */
			} );
		},

		resetCountAndLoadMore: function () {
			this.searchMore( true ).then( () => {
				/* eslint-disable camelcase */
				this.$log( {
					action: 'search_load_more',
					search_query: this.currentSearchTerm,
					search_media_type: this.currentType,
					search_result_count: this.results[ this.currentType ].length
				} );
			} );
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

			this.performNewSearch().then( () => {
				/* eslint-disable camelcase */
				this.$log( {
					action: 'search_new',
					search_query: this.currentSearchTerm,
					search_media_type: this.currentType,
					search_result_count: this.results[ this.currentType ].length
				} );
				/* eslint-enable camelcase */
			} );
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
			if ( newTab && newTab !== oldTab && this.currentSearchTerm !== '' ) {
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
			if ( newTerm === '' ) {
				this.onClear();
			} else if ( newTerm !== oldTerm ) {
				this.onTermOrFilterChange();
			}
		},

		allActiveFilters: function ( newVal, oldVal ) {
			if ( newVal !== oldVal && this.currentSearchTerm !== '' ) {
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
			if ( window.performance && window.performance.getEntriesByType ) {
				const reportLoadTiming = function () {
					const entry = performance.getEntriesByType( 'navigation' )[ 0 ];
					if ( entry && entry.loadEventEnd ) {
						mw.track( 'timing.MediaSearchPageLoad', entry.loadEventEnd );
					}
				};
				if ( document.readyState === 'complete' ) {
					reportLoadTiming();
				} else {
					window.addEventListener( 'load', reportLoadTiming );
				}
			}
		}
	},

	mounted: function () {
		// eslint-disable-next-line no-jquery/no-global-selector
		const $container = $( '#sdms-app' );
		this.$nextTick( () => {
			const readyDeferred = $.Deferred(),
				promises = $container.find( 'img' ).get().map( ( image ) => {
					// We start out with an initial serverside DOM that we'll swap out as
					// soon as the Vue components are mounted
					// Images, however, are not loaded until they become visible (their src
					// will not be set until they enter the viewport - see Image.vue
					// intersection observer), so we're going to see a FOUC when we replace
					// the initial existing content (which may have painted these images
					// already) with the new set of image nodes (that were not yet visible,
					// so have not been loaded)
					// We'll make sure to set the src attribute of all initial images ahead
					// of time and allow the images to load (this should be fast, given that
					// they've started loaded already in the serverside render) before we
					// empty the exiting content and replace it with the new JS components
					if ( !image.src && image.dataset && image.dataset.src ) {
						image.src = image.dataset.src;
					}

					if ( typeof image.decode !== 'function' ) {
						// If image.decode() isn't supported (e.g. IE) just return
						// a resolved promise.
						return $.Deferred().resolve().promise();
					}

					return image.decode().then( null,
						// turn rejected promises into successful resolves, so that below
						// $.when can act as `allSettled` (it otherwise short-circuits as
						// as soon as one of the promises fails)
						() => $.Deferred().resolve().promise()
					);
				} );

			// When above image-loading has completed, we're allowed to proceed & swap out
			// the existing DOM with the new components. It may not complete or take awhile,
			// though (e.g. many images, poor bandwidth, other issues), in which case we
			// won't let that prevent us from taking over the content: the FOUC becomes
			// a non-issue at this point because the image likely had not loaded in the
			// initial render anyway
			// We'll replace the existing render by Vue components when either of these happen:
			// - all images of the Vue render have been loaded (or confirmed to have failed)
			// - 1 second has passed
			$.when.apply( $, promises ).then( readyDeferred.resolve );
			setTimeout( readyDeferred.resolve, 1000 );
			readyDeferred.promise().then( () => {
				// only replace serverside render once entire view has rendered
				// and images are settled, ensuring a smooth transition
				$container.show().siblings().remove();
				this.ready();

				// Restore the user's previous session from localstorage if necessary
				this.restorePageStateIfNecessary();
			} );
		} );
	}
};
</script>
