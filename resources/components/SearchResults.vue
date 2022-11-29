<template>
	<div class="sdms-search-results">
		<div class="sdms-search-results__list-wrapper" :class="listWrapperClasses">
			<div
				ref="list"
				class="sdms-search-results__list"
				:class="listClasses"
			>
				<!-- Appending 'parent-' to class and style so we can access
				them in the component and prevent vue from throwing a warning,
				when migration to vue 3 is completed we can safely remove
				'parent-' from this file and all the -results.vue files -->
				<component
					:is="resultComponent"
					v-for="( result, index ) in results[ mediaType ]"
					v-bind="result"
					:ref="result.title"
					:key="index"
					:parent-class="getResultClass( result.title )"
					:parent-style="resultStyle"
					@click="onResultClick( result.title, index )"
					@show-details="showDetails( $event, index )"
				>
				</component>
			</div>

			<!-- Loading indicator if results are still pending -->
			<spinner v-if="pending[ mediaType ]" class="sdms-search-results__pending"></spinner>

			<!-- When the autoload counter for a given tab reaches zero,
			don't load more results until user explicitly clicks on a
			"load more" button; this resets the autoload count -->
			<sd-button
				v-else-if="hasMoreResults"
				class="sdms-load-more"
				:progressive="true"
				@click="$emit( 'load-more' )"
			>
				{{ $i18n( 'mediasearch-load-more-results' ).text() }}
			</sd-button>

			<!-- If an invalid search has been detected, don't display
			anything else until it has been cleared -->
			<search-error v-if="hasError"></search-error>

			<!-- No results message if search has completed and come back empty -->
			<no-results v-else-if="hasNoResults"></no-results>

			<!-- End of results message if query can no longer be continued -->
			<end-of-results v-else-if="endOfResults"></end-of-results>

			<!-- Empty-state encouraging user to search if they have not done so yet -->
			<empty-state v-else-if="shouldShowEmptyState"></empty-state>
		</div>

		<!-- QuickView dialog for mobile skin. -->
		<template v-if="isMobileSkin">
			<sd-dialog
				class="sdms-search-results__details-dialog"
				:active="!!details[ mediaType ]"
				:headless="true"
				@close="hideDetails"
				@key="onDialogKeyup"
			>
				<quick-view
					v-if="details[ mediaType ]"
					v-bind="details[ mediaType ]"
					ref="quickview"
					:key="details[ mediaType ].title"
					:media-type="mediaType"
					:is-dialog="true"
					@close="hideDetails"
					@previous="changeQuickViewResult( $event, -1 )"
					@next="changeQuickViewResult( $event, 1 )"
				></quick-view>
			</sd-dialog>
		</template>

		<!-- QuickView panel for desktop skin. -->
		<aside
			v-else
			ref="aside"
			class="sdms-search-results__details"
			:class="{ 'sdms-search-results__details--expanded': !!showQuickView }"
			:hidden="!showQuickView"
		>
			<quick-view
				v-if="details[ mediaType ]"
				v-bind="details[ mediaType ]"
				ref="quickview"
				:key="details[ mediaType ].title"
				:media-type="mediaType"
				@close="hideDetails"
				@previous="changeQuickViewResult( $event, -1 )"
				@next="changeQuickViewResult( $event, 1 )"
			>
			</quick-view>

			<div v-else class="sdms-search-results__quickview-placeholder">
				<spinner></spinner>
			</div>
		</aside>
	</div>
</template>

<script>
/**
 * @file SearchResults.vue
 *
 * The SearchResults component is responsible for displaying a list or grid of
 * search results, regardless of media type. Appearance and behavior will vary
 * depending on the value of the mediaType prop.
 *
 * This component can also display a "quickview" preview element for a given
 * result, including some additional data fetched from the API.
 */
var mapState = require( 'vuex' ).mapState,
	mapMutations = require( 'vuex' ).mapMutations,
	mapGetters = require( 'vuex' ).mapGetters,
	mapActions = require( 'vuex' ).mapActions,
	ImageResult = require( './results/ImageResult.vue' ),
	AudioResult = require( './results/AudioResult.vue' ),
	VideoResult = require( './results/VideoResult.vue' ),
	PageResult = require( './results/PageResult.vue' ),
	OtherResult = require( './results/OtherResult.vue' ),
	SdDialog = require( './base/Dialog.vue' ),
	SdButton = require( './base/Button.vue' ),
	Spinner = require( './Spinner.vue' ),
	QuickView = require( './QuickView.vue' ),
	NoResults = require( './NoResults.vue' ),
	EndOfResults = require( './EndOfResults.vue' ),
	EmptyState = require( './EmptyState.vue' ),
	SearchError = require( './SearchError.vue' );

// @vue/component
module.exports = exports = {
	name: 'SearchResults',

	components: {
		'image-result': ImageResult,
		'video-result': VideoResult,
		'audio-result': AudioResult,
		'page-result': PageResult,
		'other-result': OtherResult,
		'quick-view': QuickView,
		'sd-dialog': SdDialog,
		'sd-button': SdButton,
		spinner: Spinner,
		'empty-state': EmptyState,
		'no-results': NoResults,
		'end-of-results': EndOfResults,
		'search-error': SearchError
	},

	props: {
		mediaType: {
			type: String,
			required: true
		}
	},

	data: function () {
		return {
			// Whether to show the QuickView panel.
			showQuickView: false,
			// Which quickview control to focus on when the panel opens.
			focusOn: 'close',
			// Computed style attribute for results.
			resultStyle: null
		};
	},

	computed: $.extend( {}, mapState( [
		'continue',
		'details',
		'hasError',
		'initialized',
		'pending',
		'results'
	] ), mapGetters( [
		'allActiveDetails',
		'currentSearchTerm'
	] ), {
		/**
		 * Which component should be used to display individual search results
		 *
		 * @return {string} image-result|video-result|page-result
		 */
		resultComponent: function () {
			if ( this.mediaType === 'image' ) {
				return 'image-result';
			} else {
				return this.mediaType + '-result';
			}
		},

		/**
		 * @return {Object} Dynamic classes for the "list" element's wrapper div
		 */
		listWrapperClasses: function () {
			return {
				'sdms-search-results__list-wrapper--collapsed': !!this.showQuickView && !this.isMobileSkin
			};
		},

		/**
		 * @return {Object} Dynamic classes for the "list" element
		 */
		listClasses: function () {
			var listTypeModifier = 'sdms-search-results__list--' + this.mediaType,
				classObject = {
					'sdms-search-results__list--collapsed': !!this.showQuickView && !this.isMobileSkin
				};

			// Without ES6 string interpolation generating a dynamic classname
			// as a key requires an extra step;
			classObject[ listTypeModifier ] = true;

			return classObject;
		},

		/**
		 * @return {boolean}
		 */
		isMobileSkin: function () {
			return mw.config.get( 'skin' ) === 'minerva';
		},

		/**
		 * @return {boolean}
		 */
		hasMoreResults: function () {
			return !!this.continue[ this.mediaType ]; // we have a value for continue
		},

		/**
		 * @return {boolean}
		 */
		hasNoResults: function () {
			return this.currentSearchTerm.length > 0 && // user has entered a search term
				this.results[ this.mediaType ].length === 0 && // tab has no results
				( this.continue[ this.mediaType ] === null ); // query cannot be continued
		},

		/**
		 * @return {boolean}
		 */
		endOfResults: function () {
			return this.currentSearchTerm.length > 0 && // user has entered a search term
				this.results[ this.mediaType ].length > 0 && // tab has some results
				( this.continue[ this.mediaType ] === null ); // query cannot be continued
		},

		/**
		 * Whether to show the pre-search empty state; show this whenever a
		 * search term is not present and there are no results to display
		 *
		 * @return {boolean}
		 */
		shouldShowEmptyState: function () {
			return this.currentSearchTerm.length === 0 &&
				this.results[ this.mediaType ] &&
				this.results[ this.mediaType ].length === 0;
		}
	} ),

	methods: $.extend( {}, mapMutations( [
		'setDetails',
		'clearDetails'
	] ), mapActions( [
		'fetchDetails'
	] ), {
		/**
		 * Store the results of the fetchDetails API request as `this.details`
		 * so that it can be passed to the QuickView component.
		 *
		 * This method also handles some UX nuances of opening the QuickView
		 * panel and showing a placeholder UI while data is loading.
		 *
		 * @param {string} title
		 * @param {number} index
		 */
		showDetails: function ( title, index ) {
			var detailsTimeout;

			// Immediately open the QuickView aside. If the details haven't been
			// retrieved yet, a placeholder UI will display.
			this.showQuickView = true;

			this.$nextTick(
				function () {
					// Scroll the window to the top of the QuickView aside
					// (only happens on desktop skin)
					if ( this.$refs.aside ) {
						this.$refs.aside.scrollIntoView();
					}

					// Scroll search results to the selected result, if needed
					// (e.g. if the user is scrolling through results via
					// keyboard nav or the QuickView nav buttons).
					this.scrollIntoViewIfNeeded( title );
				}.bind( this )
			);

			// In cases where the details panel is already open and the user
			// opens a new result, we want to show the spinner while data is
			// loading, but only if it takes longer than half a second. That
			// way, for fast connections, the loading state will be less
			// noticeable.
			detailsTimeout = setTimeout( function () {
				this.clearDetails( { mediaType: this.mediaType } );
			}.bind( this ), 500 );

			// Get data for the item opened in QuickView.
			this.fetchDetails( { title: title, mediaType: this.mediaType } ).then(
				function ( response ) {
					clearTimeout( detailsTimeout );
					var searchedItemDetails;

					Object.keys( response.query.pages ).forEach(
						function ( key ) {
							if ( response.query.pages[ key ].title === title ) {
								searchedItemDetails = response.query.pages[ key ];
							}
						}
					);

					this.setDetails( {
						mediaType: this.mediaType,
						details: searchedItemDetails
					} );

					// Let the QuickView component programatically manage focus
					// once it is displayed
					this.$nextTick(
						function () {
							this.$refs.quickview.focus( this.focusOn );
						}.bind( this )
					);

					// Updated from ID to Title for new schema T297400
					/* eslint-disable camelcase */
					this.$log( {
						action: 'result_click',
						search_media_type: this.mediaType,
						search_result_page_title: title,
						search_result_position: index,
						search_result_has_quickview: true
					} );
					/* eslint-enable camelcase */
				}.bind( this )
			);
		},

		/**
		 * Reset details data to null. Restores focus to the originating result
		 * if an optional argument is provided.
		 *
		 * @param {boolean} restoreFocus
		 */
		hideDetails: function ( restoreFocus ) {
			if ( !this.details[ this.mediaType ] ) {
				return;
			}

			var originatingResultTitle = this.details[ this.mediaType ].title;

			if ( restoreFocus ) {
				// VUE 3 MIGRATION: these refs are arrays in Vue 2 but not in Vue 3
				var result = this.$refs[ originatingResultTitle ][ 0 ] ||
					this.$refs[ originatingResultTitle ];
				result.focus();
			}

			this.showQuickView = false;
			this.clearDetails( { mediaType: this.mediaType } );
			this.focusOn = 'close';

			this.$log( {
				action: 'quickview_hide'
			} );

			this.$nextTick(
				function () {
					this.scrollIntoViewIfNeeded( originatingResultTitle );
				}.bind( this )
			);
		},

		/**
		 * Scroll through results in QuickView via arrow keys.
		 *
		 * @param {boolean} shouldChangeFocus
		 * @param {number} addend 1 for next, -1 for previous
		 */
		changeQuickViewResult: function ( shouldChangeFocus, addend ) {
			var tabResults = this.results[ this.mediaType ],
				currentItem = tabResults.filter(
					function ( result ) {
						return result.title === this.details[ this.mediaType ].title;
					}.bind( this )
				),
				currentIndex = tabResults.indexOf( currentItem[ 0 ] ),
				nextIndex = currentIndex + addend;

			// If we're not surpassing either end of the results array, go to
			// the previous or next item.
			if ( nextIndex >= 0 && nextIndex < tabResults.length ) {
				this.showDetails( tabResults[ nextIndex ].title );
			}

			// When the user navigates between results via keyboard, we want the
			// new QuickView panel to focus on the just-pressed button when it
			// opens. Otherwise, we should remove focus from the close button
			// to avoid confusion for mouse-users.
			if ( shouldChangeFocus ) {
				this.focusOn = addend === 1 ? 'next' : 'previous';
			} else {
				this.focusOn = null;
			}
		},

		/**
		 * Scroll current QuickView result into view if it's not fully visible.
		 *
		 * @param {string} title
		 */
		scrollIntoViewIfNeeded: function ( title ) {
			// VUE 3 MIGRATION: these refs are arrays in Vue 2 but not in Vue 3
			var ref = Array.isArray( this.$refs[ title ] ) ?
				this.$refs[ title ][ 0 ] :
				this.$refs[ title ];

			if ( !ref ) {
				return;
			}

			var element = ref.$el,
				bounds = element.getBoundingClientRect(),
				viewportHeight = window.innerHeight || document.documentElement.clientHeight,
				isAboveViewport = bounds.top < 0 || bounds.bottom < 0,
				isBelowViewport = bounds.top > viewportHeight || bounds.bottom > viewportHeight;

			if ( isAboveViewport ) {
				// Scroll into view and align to top.
				element.scrollIntoView();
			}

			if ( isBelowViewport ) {
				// Scroll into view and align to bottom.
				element.scrollIntoView( false );
			}
		},

		/**
		 * Look for arrow keyups on dialog.
		 *
		 * @param {string} code KeyboardEvent.code
		 */
		onDialogKeyup: function ( code ) {
			if ( code === 'ArrowRight' ) {
				this.changeQuickViewResult( true, 1 );
			}

			if ( code === 'ArrowLeft' ) {
				this.changeQuickViewResult( true, -1 );
			}
		},

		/**
		 * @param {string} title
		 * @return {Object}
		 */
		getResultClass: function ( title ) {
			return {
				// Visual indication that result is currently displayed in QuickView
				'sdms-search-result--highlighted': this.details[ this.mediaType ] && this.details[ this.mediaType ].title === title,
				// If there are 3 or fewer image results, we'll limit their
				// growth to avoid having one overly-stretched image in the grid.
				'sdms-image-result--limit-size': this.mediaType === 'image' && this.results[ this.mediaType ].length <= 3
			};
		},

		/**
		 * Get style attribute for components.
		 */
		getResultStyle: function () {
			var rowWidth, rowItemCount, maxWidth;

			// Do nothing if the app isn't displayed yet, or if this isn't the
			// video tab.
			if ( !this.initialized || this.mediaType !== 'video' ) {
				return;
			}

			// Get the current width of the search results list.
			rowWidth = this.$refs.list.offsetWidth;
			if ( rowWidth === 0 ) {
				return;
			}

			// Divide row width by the min size of a result (flex-basis of 260
			// plus 16px of horizontal margin) to find the current number of
			// items per row.
			rowItemCount = Math.floor( ( rowWidth - 20 ) / 272 );

			// If this number is greater than the number of results, set
			// max-width to the natural max-width in this particular flex layout
			// to avoid overly-stretching the components. Note that this value
			// is also set in the CSS so that the PHP version of these
			// components aren't too wide, helping to avoid a layout jump when
			// the JS UI loads.
			if ( rowItemCount > this.results[ this.mediaType ].length ) {
				maxWidth = 401.5;
			} else {
				// Find the current width of each item in a full row, and
				// account for the 16 px of negative horizontal margin.
				maxWidth = ( rowWidth / rowItemCount ) - 16;
			}

			this.resultStyle = {
				'max-width': maxWidth.toString() + 'px'
			};
		},

		/**
		 * Debounced version of getResultStyle for use in a resize listener
		 */
		getDebouncedResultStyle: function () {
			clearTimeout( this.debounceTimeoutId );
			this.debounceTimeoutId = setTimeout(
				this.getResultStyle.bind( this ),
				250
			);
		},

		/**
		 * Clicks on results that do not display a quickview should still be
		 * logged for analytics purposes.
		 *
		 * @param {string} title
		 * @param {number} index
		 * @todo reimplement logging once an updated event schema is available
		 */
		// eslint-disable-next-line no-unused-vars
		onResultClick: function ( title, index ) {
			// Logging code temporariliy removed due to T297400
			// Restore when an updated event schema is available
		}
	} ),

	watch: {
		// if search term changes, immediately discard any expanded detail view
		currentSearchTerm: function ( /* newTerm */ ) {
			this.showQuickView = false;
			this.clearDetails( { mediaType: this.mediaType } );
		},

		initialized: function () {
			this.getResultStyle();
		},

		allActiveDetails: function ( newVal ) {
			var currentDetails = JSON.parse( newVal );

			if ( currentDetails[ this.mediaType ] && !this.showQuickView ) {
				this.showQuickView = true;
			}

			this.$nextTick().then( this.getResultStyle.bind( this ) );
		}
	},

	created: function () {
		window.addEventListener( 'resize', this.getDebouncedResultStyle );
	},

	unmounted: function () {
		window.removeEventListener( 'resize', this.getDebouncedResultStyle );
	}
};
</script>
