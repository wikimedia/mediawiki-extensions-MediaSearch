<template>
	<a
		v-if="imageinfo"
		ref="link"
		class="sdms-image-result"
		:href="canonicalurl"
		:title="title"
		:class="[ rootClasses, $attrs[ 'parent-class' ] ]"
		:style="[ style, $attrs[ 'parent-style' ] ]"
		@click.left.exact="showDetails"
	>
		<sdms-image
			:source="thumbnail"
			:alt="displayName"
			:original-width="width"
			:original-height="height"
		>
		</sdms-image>
	</a>
</template>

<script>
/**
 * @file ImageResult.vue
 *
 * Image-specific search result layout. Implements the general searchResult
 * mixin and includes some custom computed properties.
 */
var searchResult = require( '../../mixins/searchResult.js' ),
	SdImage = require( './../base/Image.vue' );

// @vue/component
module.exports = exports = {
	name: 'ImageResult',

	components: {
		'sdms-image': SdImage
	},

	mixins: [ searchResult ],

	inheritAttrs: false,

	computed: {
		/**
		 * @return {Object}
		 */
		rootClasses: function () {
			return {
				'sdms-image-result--portrait': this.aspectRatio < 1
			};
		},

		/**
		 * Original image width.
		 *
		 * @return {number}
		 */
		width: function () {
			return this.imageinfo[ 0 ].width;
		},

		/**
		 * Original image height.
		 *
		 * @return {number}
		 */
		height: function () {
			return this.imageinfo[ 0 ].height;
		},

		/**
		 * @return {number}
		 */
		thumbheight: function () {
			return this.imageinfo[ 0 ].thumbheight;
		},

		/**
		 * @return {number}
		 */
		thumbwidth: function () {
			return this.imageinfo[ 0 ].thumbwidth;
		},

		/**
		 * @return {number}
		 */
		aspectRatio: function () {
			return this.width / this.height;
		},

		/**
		 * Generate a style object with a width rule. Note that height is being
		 * set in LESS since it never changes.
		 *
		 * @return {Object}
		 */
		style: function () {
			var width = this.thumbwidth;

			// For images with height < 180px, use the actual thumbwidth, to
			// avoid displaying a large gray background with a small image
			// centered inside. We'll add 60px to the width to give the
			// appearance of a little left and right padding, since it will
			// look like there's top and bottom padding.
			if ( this.thumbheight < 180 ) {
				width += 60;
			}

			// We want to avoid super wide images (like panoramas), which can
			// lead to gaps in the layout due to other width restrictions we're
			// making.
			width = Math.min( width, 350 );

			return {
				width: width + 'px'
			};
		}
	}
};
</script>
