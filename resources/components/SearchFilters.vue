<template>
	<div class="sdms-search-filters-wrapper" :class="rootClasses">
		<div class="sdms-search-filters">
			<template v-for="( filter, index ) in searchFilters">
				<div :key="'filter-' + index">
					<sd-select
						v-if="filter.type !== 'namespace'"
						:ref="filter.type"
						:class="getFilterClasses( filter.type )"
						:name="filter.type"
						:items="filter.items"
						:initial-selected-item-index="0"
						:prefix="getFilterPrefix( filter.type )"
						@select="onSelect( $event, filter.type )"
					>
					</sd-select>

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
			</template>
			<div class="sdms-search-results-count">
				<span v-if="showResultsCount">
					{{ resultsCount }}
				</span>
				<sd-observer
					v-if="supportsObserver"
					:options="{ threshold: 1 }"
					@intersect="removeGradientClass"
					@hide="addGradientClass"
				></sd-observer>
			</div>
		</div>

		<namespace-filter-dialog
			v-if="namespaceFilter"
			ref="namespace"
			:items="namespaceFilter.items"
			:namespaces="namespaceFilter.data.namespaceGroups.all"
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
	SdObserver = require( './base/Observer.vue' ),
	SdButton = require( './base/Button.vue' ),
	NamespaceFilterDialog = require( './NamespaceFilterDialog.vue' ),
	SearchFilter = require( '../models/SearchFilter.js' ),
	searchOptions = require( './../data/searchOptions.json' );

// @vue/component
module.exports = {
	name: 'SearchFilters',

	components: {
		'sd-select': SdSelect,
		'sd-observer': SdObserver,
		'sd-button': SdButton,
		'namespace-filter-dialog': NamespaceFilterDialog
	},

	props: {
		mediaType: {
			type: String,
			required: true
		}
	},

	data: function () {
		return {
			hasGradient: false,
			namespaceFilterDialogActive: false
		};
	},

	computed: $.extend( {}, mapState( [
		'totalHits',
		'filterValues'
	] ), {
		/**
		 * @return {Object}
		 */
		rootClasses: function () {
			return {
				'sdms-search-filters-wrapper--gradient': this.hasGradient
			};
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

		supportsObserver: function () {
			return 'IntersectionObserver' in window &&
				'IntersectionObserverEntry' in window &&
				'intersectionRatio' in window.IntersectionObserverEntry.prototype;
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
				this.totalHits[ this.mediaType ].toLocaleString( mw.config.get( 'wgUserLanguage' ) )
			);
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
			);
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
			var oldValue = this.filterValues[ this.mediaType ][ filterType ] || '';

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
		 * @return {string}
		 */
		getFilterPrefix: function ( filterType ) {
			if ( filterType === 'sort' ) {
				return this.$i18n( 'mediasearch-filter-sort-label' );
			}

			return '';
		},

		/**
		 * When final filter is out of view, add class that will add a gradient
		 * to indicate to the user that they can horizontally scroll.
		 */
		addGradientClass: function () {
			this.hasGradient = true;
		},

		/**
		 * When final filter is in view, don't show the gradient.
		 */
		removeGradientClass: function () {
			this.hasGradient = false;
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
				this.$refs[ filter.type ][ 0 ];
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
