<template>
	<img
		:src="observerSupported ? null : source"
		:data-src="source"
		:alt="alt"
		class="sd-image"
		loading="lazy"
		:style="imageStyle"
	>
</template>

<script>
var observer = require( './mixins/observer.js' );

// @vue/component
module.exports = exports = {
	name: 'SdImage',

	mixins: [ observer ],
	props: {
		source: {
			type: String,
			required: true
		},

		alt: {
			type: String,
			default: ''
		},

		originalWidth: {
			type: Number,
			default: 0
		},

		originalHeight: {
			type: Number,
			default: 0
		}
	},

	data: function () {
		return {
			debounceTimeoutId: null,
			// eslint-disable-next-line vue/no-unused-properties
			observerOptions: {
				// Set the detection area to extend past the bottom of the
				// viewport by 50% (a figure that comes from MobileFrontEnd) so
				// images will load before they enter the viewport.
				rootMargin: '0px 0px 50% 0px',
				threshold: 0
			}
		};
	},

	computed: {

		/**
		 * If we have image dimensions, add a style attribute to constrain the
		 * image to its original size to avoid stretching a small image.
		 *
		 * @return {Object|boolean}
		 */
		imageStyle: function () {
			if ( this.originalWidth > 0 && this.originalHeight > 0 ) {
				return {
					// There are height and max-width rules with the important
					// keyword for .content a > img in Minerva Neue, and they
					// have to be overridden.
					// I don't see any other way around this...
					height: '100% !important',
					maxWidth: this.originalWidth + 'px !important',
					maxHeight: this.originalHeight + 'px'
				};
			}
			return false;
		}
	},

	methods: {
		loadImageIfIntersecting: function () {
			if ( this.observerIntersecting ) {
				// set the "src" attribute so the image loads
				this.$el.src = this.$el.dataset.src;
				this.disconnectObserver();
			}
		}
	},

	watch: {
		observerIntersecting: {
			handler: function ( intersecting ) {
				if ( intersecting ) {
					// debounce to avoid loading images that are rapidly scrolled
					// out of screen anyway
					clearTimeout( this.debounceTimeoutId );
					this.debounceTimeoutId = setTimeout(
						this.loadImageIfIntersecting.bind( this ),
						250
					);
				}
			},
			immediate: true
		}
	}
};
</script>
