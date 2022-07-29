<template>
	<div class="sd-observer"></div>
</template>

<script>
/**
 * Observer.vue
 *
 * This component is a simple wrapper for the observer reusable mixins that offers
 * Intersection Observer feature
 * (https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API),
 * which provides a simple way to determine when an element intersects with the
 * viewport (or a specific subsection of the viewport).
 *
 * By itself this component should have no visual or behavioral impact on the
 * UI. It uses a reusable Mixins (observer), that emits three diffrent message:
 * - intersect: Triggered when the element is intersecting
 * - hide: Triggered when the element is not intersecting anymore
 * - change: Triggered everytime there is a change in the intersecting
 */
var observer = require( './mixins/observer.js' );

// @vue/component
module.exports = exports = {
	name: 'SdObserver',

	compatConfig: {
		ATTR_FALSE_VALUE: true
	},

	mixins: [ observer ],
	props: {
		// IntersectObserver Options object used to overrride the Observer mixins options
		// eslint-disable-next-line vue/require-default-prop
		options: Object
	},
	data: function () {
		return {
			// eslint-disable-next-line vue/no-unused-properties
			observerOptions: this.options
		};
	}
};
</script>
