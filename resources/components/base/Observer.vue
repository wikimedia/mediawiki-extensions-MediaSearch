<template>
	<div class="sd-observer"></div>
</template>

<script>
/**
 * Observer.vue
 *
 * This component is a simple wrapper for an Intersection Observer object
 * (https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API),
 * which provides a simple way to determine when an element intersects with the
 * viewport (or a specific subsection of the viewport).
 *
 * By itself this component should have no visual or behavioral impact on the
 * UI. It simply emits an "intersect" event which can be handled by the parent
 * as needed. Add this component to the end of a list for an "infinite scroll"
 * effect.
 */
var observer = require( './mixins/observer.js' );

module.exports = {
	name: 'SdObserver',
	mixins: [ observer ],
	props: {
		// IntersectObserver Options object used to overrride the Observer mixins options
		options: Object
	},
	data: function () {
		return {
			observerOptions: this.options
		};
	}
};
</script>
