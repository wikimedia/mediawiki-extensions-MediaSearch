<template>
	<a
		ref="link"
		class="sdms-video-result"
		:href="canonicalurl"
		:title="title"
		@click="showDetails"
	>
		<img
			:src="thumbnail"
			:alt="displayName"
			class="sdms-video-result__thumbnail"
			loading="lazy"
		>

		<div class="sdms-video-result__body">
			<h3 v-if="displayName" class="sdms-video-result__title">
				{{ displayName }}
			</h3>

			<h4 class="sdms-video-result__meta">
				<span class="sdms-video-result__duration">
					<sd-icon :icon="icon"></sd-icon>
					<span
						v-if="formattedDuration"
						class="sdms-video-result__duration__text"
					>
						{{ formattedDuration }}
					</span>
				</span>
				<span v-if="mime" class="sdms-video-result__mime">
					{{ mime }}
				</span>
			</h4>
		</div>
	</a>
</template>

<script>
/**
 * @file VideoResult.vue
 *
 * Video-specific search result layout. Implements the general searchResult
 * mixin as well as the "time-based" result mixin. Also includes custom
 * computed properties for resolution and mime type.
 */
var searchResult = require( '../../mixins/searchResult.js' ),
	searchResultTimeBased = require( '../../mixins/searchResultTimeBased.js' ),
	SdIcon = require( '../base/Icon.vue' ),
	icons = require( '../../../lib/icons.js' );

// @vue/component
module.exports = {
	name: 'VideoResult',

	components: {
		'sd-icon': SdIcon
	},

	mixins: [ searchResult, searchResultTimeBased ],

	inheritAttrs: false,

	data: function () {
		return {
			icon: icons.sdIconPlay
		};
	},

	computed: {
		/**
		 * @return {string}
		 */
		resolution: function () {
			var width = this.imageinfo[ 0 ].width,
				height = this.imageinfo[ 0 ].height;

			return width + 'x' + height;
		}
	}
};
</script>
