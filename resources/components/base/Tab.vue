<template>
	<div
		v-show="isActive"
		:id="id"
		:aria-hidden="!isActive || null"
		:aria-labeledby="id + '-label'"
		class="sd-tab"
		role="tabpanel"
	>
		<slot></slot>
	</div>
</template>

<script>
var VueCompositionAPI = require( '@vue/composition-api' );
/**
 * A single tab, to be used inside a Tabs component. See App for usage example.
 */
// @vue/component
module.exports = exports = {
	name: 'SdTab',

	/* eslint-disable vue/no-unused-properties */
	props: {
		name: {
			type: String,
			required: true
		},

		title: {
			type: String,
			required: true
		},

		disabled: {
			type: Boolean
		}
	},

	setup: function ( props ) {
		// Unwrap props and Inject data provided by the parent component
		// (Tabs).
		var name = VueCompositionAPI.toRefs( props ).name,
			currentTabName = VueCompositionAPI.inject( 'currentTabName' );

		/**
		 * @type {boolean}
		 */
		var isActive = VueCompositionAPI.computed( function () {
			return name.value === currentTabName.value;
		} );

		/**
		 * @type {string}
		 */
		var id = VueCompositionAPI.computed( function () {
			return 'sd-tab-' + name.value;
		} );

		return {
			isActive: isActive,
			id: id
		};
	}
};
</script>
