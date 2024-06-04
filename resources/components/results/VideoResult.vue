<template>
	<a
		ref="link"
		class="sdms-video-result"
		:href="canonicalurl"
		:title="title"
		:class="$attrs[ 'parent-class' ]"
		:style="$attrs[ 'parent-style' ]"
		@click.left.exact="showDetails"
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
					<cdx-icon :icon="cdxIconPlay" size="small"></cdx-icon>
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
 * mixin as well as the "time-based" result mixin.
 */
var searchResult = require( '../../mixins/searchResult.js' ),
	searchResultTimeBased = require( '../../mixins/searchResultTimeBased.js' );

const { CdxIcon } = require( '@wikimedia/codex' );
const { cdxIconPlay } = require( '../icons.json' );

// @vue/component
module.exports = exports = {
	name: 'VideoResult',

	components: {
		CdxIcon
	},

	mixins: [ searchResult, searchResultTimeBased ],

	inheritAttrs: false,

	data: function () {
		return {
			cdxIconPlay
		};
	}
};
</script>
