<template>
	<div class="sdms-search-filters-wrapper" :class="rootClasses">
		<div
			ref="filters"
			class="sdms-search-filters"
			role="group"
			:aria-label="filtersLabel"
			:aria-describedby="searchCountId"
			tabindex="0"
			@scroll.passive="onScroll"
		>
			<div v-for="( filter, index ) in searchFilters" :key="'filter-' + index">
				<!-- Namespace filter requires special treatment; see below. -->
				<!-- Sort filter has slightly different behavior from other
				non-namespace filters because one of the two options
				(relevance or recency) must always be selected. For other
				filters, a generic label must be shown whenever their value
				is un-set. See T285349 for more context. -->
				<sd-select
					v-if="filter.type !== 'namespace'"
					:ref="filter.type"
					:class="getFilterClasses( filter.type )"
					:name="filter.type"
					:items="filter.items"
					:label="getFilterDefaultLabel( filter.type )"
					:initial-selected-item-index="filter.type === 'sort' ? 0 : -1"
					:prefix="getFilterPrefix( filter.type )"
					@select="onSelect( $event, filter.type )"
				>
				</sd-select>

				<!-- Namespace filter is represented as a button that
				launches a modal -->
				<sd-button
					v-else
					:key="'filter-namespace-' + index"
					class="sdms-search-filters__namespace"
					:class="namespaceFilterClasses"
					@click="namespaceFilterDialogActive = true"
				>
					{{ namespaceFilterLabel }}
				</sd-button>
			</div>

			<div class="sdms-search-results-count">
				<span v-if="showResultsCount" :id="searchCountId">
					{{ resultsCount }}
				</span>
			</div>
		</div>

		<namespace-filter-dialog
			v-if="namespaceFilter"
			ref="namespace"
			:items="namespaceFilter.items"
			:namespaces="namespaceFilter.data.namespaceGroups.all_incl_file"
			:namespace-groups="namespaceFilter.data.namespaceGroups"
			:active="namespaceFilterDialogActive"
			:initial-value="namespaceFilterValue"
			@submit="onSelect( $event, 'namespace' )"
			@close="namespaceFilterDialogActive = false"
		>
		</namespace-filter-dialog>
	</div>
</template>

<script>
/**
 * @file SearchFilters.vue
 *
 * Container for the search filters for a tab. Displays the filters and handles
 * change in filter value. When a filter value changes, the Vuex state is
 * updated with the new filter value, and a new-search event is emitted so the
 * parent App component can dispatch the search action.
 */
var mapState = require( 'vuex' ).mapState,
	mapMutations = require( 'vuex' ).mapMutations,
	SdSelect = require( './base/Select.vue' ),
	SdButton = require( './base/Button.vue' ),
	NamespaceFilterDialog = require( './NamespaceFilterDialog.vue' ),
	SearchFilter = require( '../models/SearchFilter.js' ),
	searchOptions = require( './../data/searchOptions.json' ),
	observer = require( './base/mixins/observer.js' );

// @vue/component
module.exports = exports = {
	name: 'SearchFilters',

	components: {
		'sd-select': SdSelect,
		'sd-button': SdButton,
		'namespace-filter-dialog': NamespaceFilterDialog
	},

	mixins: [ observer ],

	props: {
		mediaType: {
			type: String,
			required: true
		}
	},

	data: function () {
		return {
			hasOverflow: false,
			isScrolledToEnd: false,
			namespaceFilterDialogActive: false,
			observerOptions: {
				threshold: 1
			},
			observerElement: '.sdms-search-results-count'
		};
	},

	computed: $.extend( {}, mapState( [
		'totalHits',
		'filterValues'
	] ), {
		/**
		 * Due to this component being used multiple times,
		 * we need to ensure the ID is unique
		 * @return {string}
		 */
		searchCountId: function () {
			return this.mediaType + '-count';
		},

		/**
		 * @return {string}
		 */
		filtersLabel: function () {
			return this.mediaType + ' filters';
		},

		/**
		 * @return {Object}
		 */
		rootClasses: function () {
			return {
				'sdms-search-filters-wrapper--gradient': this.showGradient
			};
		},

		showGradient: function () {
			return this.hasOverflow && !this.isScrolledToEnd;
		},

		/**
		 * @return {Object}
		 */
		namespaceFilterClasses: function () {
			var selected = ( 'namespace' in this.filterValues[ this.mediaType ] );
			return {
				'sdms-search-filters__namespace--selected': selected
			};
		},

		/**
		 * @return {Array} SearchFilter objects for this media type.
		 */
		searchFilters: function () {
			var optionsForType = searchOptions[ this.mediaType ],
				filters = [];

			Object.keys( optionsForType ).forEach( function ( filterName ) {
				var filterData = optionsForType[ filterName ],
					filter = new SearchFilter(
						filterName,
						filterData.items,
						filterData.data
					);
				filters.push( filter );
			} );
			return filters;
		},

		/**
		 * Key names (not values) of all active filters for the given tab;
		 * Having a shorthand computed property for this makes it easier to
		 * watch for changes.
		 *
		 * @return {Array} Empty array or [ "imageres", "filemime" ], etc
		 */
		currentActiveFilters: function () {
			return Object.keys( this.filterValues[ this.mediaType ] );
		},

		/**
		 * Number of results should only display if results exist.
		 *
		 * @return {boolean} Whether to display the results count
		 */
		showResultsCount: function () {
			return this.totalHits[ this.mediaType ] > 0;
		},

		/**
		 * String representing the number of search results.
		 *
		 * @return {Object} Message object
		 */
		resultsCount: function () {
			return this.$i18n(
				'mediasearch-results-count',
				mw.language.convertNumber( this.totalHits[ this.mediaType ] )
			).text();
		},

		/**
		 * Get a human-readable label for the namespace filter button.
		 *
		 * @return {Object}
		 */
		namespaceFilterLabel: function () {
			var namespaceGroups = this.namespaceFilter.data.namespaceGroups,
				messageKey,
				filterValue = 'all';

			// If there is a namespace filter value...
			if ( 'namespace' in this.filterValues[ this.mediaType ] ) {
				// If the filter value is one of the namespace groups, use that.
				// Otherwise, it's a string of custom namespaces, so use the
				// 'custom' label.
				filterValue = namespaceGroups[ this.filterValues[ this.mediaType ].namespace ] ?
					this.filterValues[ this.mediaType ].namespace : 'custom';
			}

			messageKey = 'mediasearch-filter-namespace-' + filterValue;

			// Return the label message, which takes the filter value as a
			// param and will return something like "Namespace: Discussion".
			// The following messages are used here:
			// * mediasearch-filter-namespace-all
			// * mediasearch-filter-namespace-discussion
			// * mediasearch-filter-namespace-help
			// * mediasearch-filter-namespace-custom
			return this.$i18n(
				'mediasearch-filter-namespace-label',
				this.$i18n( messageKey )
			).text();
		},

		/**
		 * Current value of the namespace filter (defaults to 'all').
		 *
		 * @return {string}
		 */
		namespaceFilterValue: function () {
			return 'namespace' in this.filterValues[ this.mediaType ] ?
				this.filterValues[ this.mediaType ].namespace : 'all';
		},

		/**
		 * Get the namespace search filter, if it exists.
		 *
		 * @return {Object|undefined}
		 */
		namespaceFilter: function () {
			// Array.prototype.find is polyfilled so we can use this
			// ES6 array method here

			// eslint-disable-next-line no-restricted-syntax
			return this.searchFilters.find( function ( filter ) {
				return filter.type === 'namespace';
			} );
		}
	} ),

	methods: $.extend( {}, mapMutations( [
		'addFilterValue',
		'removeFilterValue'
	] ), {
		/**
		 * Handle filter change.
		 *
		 * @param {string|Object} value The new filter value; namespace filter values are objects
		 * @param {string} filterType
		 * @fires filter-change
		 */
		onSelect: function ( value, filterType ) {
			var oldValue = this.filterValues[ this.mediaType ][ filterType ] || '',
				// eslint-disable-next-line no-restricted-syntax
				currentFilter = this.searchFilters.find( function ( filter ) {
					return filter.type === filterType;
				} );

			// for logging purposes, we only want a simple string value
			function normalizedValue( v ) {
				return v.value ? v.value : v;
			}

			if ( value ) {
				this.addFilterValue( {
					mediaType: this.mediaType,
					filterType: filterType,
					value: value
				} );
				/* eslint-disable camelcase */
				this.$log( {
					action: 'filter_change',
					search_media_type: this.mediaType,
					search_filter_type: filterType,
					search_filter_value: normalizedValue( value ),
					prior_search_filter_type: filterType,
					prior_search_filter_value: normalizedValue( oldValue )
				} );
				/* eslint-enable camelcase */
			} else {
				this.removeFilterValue( {
					mediaType: this.mediaType,
					filterType: filterType
				} );

				// Un-set the filter so that the initial label is displayed
				// when an "empty value" option is selected
				this.getRef( currentFilter ).reset();

				/* eslint-disable camelcase */
				this.$log( {
					action: 'filter_change',
					search_media_type: this.mediaType,
					search_filter_type: filterType,
					search_filter_value: '',
					prior_search_filter_type: filterType,
					prior_search_filter_value: normalizedValue( oldValue )
				} );
				/* eslint-enable camelcase */
			}

			// Tell the App component to do a new search and update the URL
			// params
			this.$emit( 'filter-change', {
				mediaType: this.mediaType,
				filterType: filterType,
				value: value
			} );
		},

		/**
		 * We need a class for select lists where a non-default item is selected.
		 *
		 * @param {string} filterType
		 * @return {Object}
		 */
		getFilterClasses: function ( filterType ) {
			return {
				'sdms-search-filter--selected': this.currentActiveFilters.indexOf( filterType ) !== -1
			};
		},

		/**
		 * Add select list prefixes per filter type.
		 *
		 * @param {string} filterType
		 * @return {mw.Message} message object
		 */
		getFilterPrefix: function ( filterType ) {
			if ( filterType === 'sort' ) {
				return this.$i18n( 'mediasearch-filter-sort-label' ).text();
			}

			return '';
		},

		/**
		 * @param {string} filterType
		 * @return {mw.Message} message object
		 */
		getFilterDefaultLabel: function ( filterType ) {
			switch ( filterType ) {
				case 'filemime':
					return this.$i18n( 'mediasearch-filter-file-type' ).text();
				case 'fileres':
					return this.$i18n( 'mediasearch-filter-size' ).text();
				case 'assessment':
					return this.$i18n( 'mediasearch-filter-assessment' ).text();
				case 'haslicense':
					return this.$i18n( 'mediasearch-filter-license' ).text();
				default:
					return;
			}
		},

		/**
		 * Get the ref for a filter.
		 *
		 * Because the namespace filter is handled outside the v-for loop that
		 * creates the other filter elements, we need to access its ref a little
		 * differently.
		 *
		 * @param {Object} filter A search filter object
		 * @return {Object}
		 */
		getRef: function ( filter ) {
			return filter.type === 'namespace' ?
				this.$refs[ filter.type ] :
				// VUE 3 MIGRATION: these refs are arrays in Vue 2 but not in Vue 3
				this.$refs[ filter.type ][ 0 ] || this.$refs[ filter.type ];
		},

		resetAllFilters: function () {
			this.searchFilters.forEach( function ( filter ) {
				this.getRef( filter ).reset();
			}.bind( this ) );
		},

		/**
		 * Set each filter component's state to match the appropriate
		 * value in Vuex
		 */
		synchronizeFilters: function () {
			this.searchFilters.forEach( function ( filter ) {
				var currentValue = this.filterValues[ this.mediaType ][ filter.type ],
					ref = this.getRef( filter );

				if ( currentValue ) {
					// Attempt to set each filter to the specified value in
					// Vuex.  If the value doesn't exist, remove the value from
					// the Vuex store and emit a filter-change event so that the
					// page and URL get updated.
					try {
						ref.select( currentValue );
					} catch ( e ) {
						this.removeFilterValue( {
							mediaType: this.mediaType,
							filterType: filter.type
						} );
						this.$emit( 'filter-change', {
							mediaType: this.mediaType,
							filterType: filter.type
						} );
					}
				} else {
					ref.reset();
				}
			}.bind( this ) );
		},

		/**
		 * Handle horizontal scrolling events in the filters bar when they
		 * must overflow (smaller screens only), to determine whether or not
		 * the user has scrolled to the end (plus or minus 1 pixel) of the
		 * content.
		 *
		 * @param {Event} e
		 */
		onScroll: function ( e ) {
			var el = e.target,
				scrollMax = el.scrollWidth - el.clientWidth;

			// Allow a margin of error of 1px due to JS rounding weirdness;
			if ( scrollMax - el.scrollLeft <= 1 ) {
				this.isScrolledToEnd = true;
			} else {
				this.isScrolledToEnd = false;
			}
		}
	} ),

	watch: {
		/**
		 * Programmatically set or reset filters if Vuex state changes for
		 * reasons other than the user setting filters manually (clicking the
		 * clear button, URL filter params, popstate, etc)
		 */
		currentActiveFilters: function () {
			this.synchronizeFilters();
		},

		observerIntersecting: {
			handler: function ( intersecting ) {
				this.hasOverflow = !intersecting;
			},
			immediate: true
		}
	},

	/**
	 * If filters have already been set at the time of page initialization
	 * via URL params, update the relevant Select child component with
	 * the appropriate value
	 */
	mounted: function () {
		this.synchronizeFilters();
	}
};
</script>
