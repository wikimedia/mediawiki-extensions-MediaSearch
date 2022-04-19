<template>
	<div class="sd-tabs">
		<div class="sd-tabs__header" :class="headerClasses">
			<div
				class="sd-tabs__tabs-list"
				role="tablist"
				aria-label="Media type"
				tabindex="0"
				:aria-activedescendant="currentTabId"
				@keydown.left.prevent="prev"
				@keydown.up.prevent="prev"
				@keydown.right.prevent="next"
				@keydown.down.prevent="next"
			>
				<div
					v-for="(tab, index) in tabs"
					:id="tab.name + '-label'"
					:key="tab.title"
					:class="getLabelClasses(tab, index)"
					:aria-selected="tab.name === currentTabName || null"
					:aria-controls="tab.name + '-control'"
					class="sd-tabs__tabs-list__item"
					role="tab"
					tabindex="-1"
					@click="selectTab(tab.name)"
					@keyup.enter="selectTab(tab.name)"
				>
					{{ tab.title }}
				</div>
			</div>
		</div>

		<div class="sd-tabs__content">
			<slot></slot>
		</div>
	</div>
</template>

<script>
var Vue = require( 'vue' ), // Vue is imported here for type definition
	VueCompositionAPI = require( '@vue/composition-api' ),
	observer = require( './mixins/observer.js' );

/**
 * A group of tabs with a tab menu.
 *
 * Tab can be changed via user click on a tab menu item or by changing the
 * active prop passed to the Tabs component.
 */
// @vue/component
module.exports = exports = {
	name: 'SdTabs',

	mixins: [ observer ],

	props: {
		/**
		 * Name of the currently active tab.
		 *
		 * This is not required: if omitted, the first tab will be active on
		 * mount, then this component will keep track of any tab changes.
		 * However, if you need to be able to control the active tab from the
		 * parent component, use this prop and keep it current by binding it to
		 * a value that updates on the tab-change event.
		 */
		active: {
			type: String,
			default: null
		}
	},

	setup: function ( props, context ) {
		// Define reactive values
		var tabs = VueCompositionAPI.reactive( {} ),
			active = VueCompositionAPI.toRef( props, 'active' ),
			currentTabName = VueCompositionAPI.ref( null ),
			hasGradient = VueCompositionAPI.ref( false ),
			observerElement = VueCompositionAPI.ref( '.sd-tabs__tabs-list__item--last' ),
			observerOptions = VueCompositionAPI.reactive( { threshold: 1 } );

		/**
		 * @type {Object} Class binding object for the header
		 */
		var headerClasses = VueCompositionAPI.computed( function () {
			return { 'sd-tabs__header--gradient': hasGradient.value };
		} );

		/**
		 * @type {string|undefined} DOM ID of the active tab
		 */
		var currentTabId = VueCompositionAPI.computed( function () {
			if ( !currentTabName ) {
				return;
			}

			return tabs[ currentTabName.value ] ?
				'sd-tab-' + tabs[ currentTabName.value ].name + '-label' :
				null;
		} );

		/**
		 * Initialize tab data.
		 *
		 * Requires different behavior in Vue 2 vs Vue 3; in the former,
		 * context.slots.default() returns the array of child tabs directly;
		 * in Vue 3 they are wrapped in a Fragment VNode.
		 */
		VueCompositionAPI.onMounted( function () {
			// unwrap the fragment if present (Vue 3)
			var defaultSlot = context.slots.default(),
				tabNodes = defaultSlot[ 0 ] && defaultSlot[ 0 ].children || defaultSlot;

			/**
			 * @todo Once migrated to Vue 3, remove 'tab.componentOptions.propsData'
			 */
			tabNodes.forEach( function ( tab ) {
				var componentProps = tab.componentOptions ? tab.componentOptions.propsData : tab.props;
				tabs[ componentProps.name ] = componentProps;
			} );

			// Set the current tab value, either to the active prop if it's
			// provided or to the first tab.
			currentTabName.value = ( active.value ) ? active.value : Object.keys( tabs )[ 0 ];
		} );

		/**
		 * Provide reactive data to the child Tab components so they know
		 * whether or not they are currently active.
		 */
		VueCompositionAPI.provide( 'currentTabName', currentTabName );

		return {
			tabs: tabs,
			currentTabName: currentTabName,
			currentTabId: currentTabId,
			headerClasses: headerClasses,
			hasGradient: hasGradient,
			observerElement: observerElement,
			observerOptions: observerOptions
		};
	},

	methods: {
		/**
		 * Change the current tab.
		 *
		 * @param {string} tabName
		 */
		selectTab: function ( tabName ) {
			if ( this.tabs[ tabName ].disabled === true ) {
				return;
			}

			this.currentTabName = tabName;
		},

		/**
		 * Set tab label classes.
		 *
		 * @param {Vue.component} tab
		 * @param {number} index
		 * @return {Object}
		 */
		getLabelClasses: function ( tab, index ) {
			return {
				'sd-tabs__tabs-list__item--current': tab.name === this.currentTabName,
				'sd-tabs__tabs-list__item--disabled': tab.disabled,
				'sd-tabs__tabs-list__item--last': this.isLastTab( index )
			};
		},

		/**
		 * Left or up arrow keydown should move to previous tab, if one exists.
		 */
		prev: function () {
			var tabNames = Object.keys( this.tabs ),
				previousTabIndex = tabNames.indexOf( this.currentTabName ) - 1;

			if ( previousTabIndex < 0 ) {
				// There is no previous tab, do nothing.
				return;
			}

			this.selectTab( Object.keys( this.tabs )[ previousTabIndex ] );
		},

		/**
		 * Right or down arrow keydown should move to next tab, if one exists.
		 */
		next: function () {
			var tabNames = Object.keys( this.tabs ),
				nextTabIndex = tabNames.indexOf( this.currentTabName ) + 1;

			if ( nextTabIndex >= tabNames.length ) {
				// There is no next tab, do nothing.
				return;
			}

			this.selectTab( tabNames[ nextTabIndex ] );
		},

		/**
		 * @param {number} tabIndex
		 * @return {boolean}
		 */
		isLastTab: function ( tabIndex ) {
			var tabKeys = Object.keys( this.tabs );
			return tabIndex === tabKeys[ tabKeys.length - 1 ];
		}
	},

	watch: {
		/**
		 * When the tab stored in state changes, select that tab.
		 *
		 * @param {string} newTabName
		 */
		active: function ( newTabName ) {
			this.selectTab( newTabName );
		},

		/**
		 * When the current tab changes, set active states and emit an event.
		 *
		 * @param {string} newTabName
		 */
		currentTabName: function () {
			// Don't emit an event if the currentTabName changed as a result of
			// the active prop changing. In that case, the parent already knows.
			if ( this.currentTabName !== this.active ) {
				this.$emit( 'tab-change', this.currentTabName );
			}
		},

		observerIntersecting: {
			handler: function ( intersecting ) {
				this.hasGradient = !intersecting;
			},
			immediate: true
		}
	}
};
</script>
