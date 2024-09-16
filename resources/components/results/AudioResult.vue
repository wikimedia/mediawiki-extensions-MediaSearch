<template>
	<div
		class="sdms-audio-result"
		:class="$attrs[ 'parent-class' ]"
		:style="$attrs[ 'parent-style' ]"
	>
		<h3 v-if="displayName" class="sdms-audio-result__title">
			<a
				ref="link"
				:href="canonicalurl"
				:title="title"
				@click.left.exact="showDetails"
			>
				{{ displayName }}
			</a>
		</h3>

		<h4 class="sdms-audio-result__meta">
			<span class="sdms-audio-result__duration">
				<cdx-icon :icon="cdxIconVolumeUp" size="small"></cdx-icon>
				<span
					v-if="formattedDuration"
					class="sdms-audio-result__duration__text"
				>
					{{ formattedDuration }}
				</span>
			</span>
			<span v-if="mime" class="sdms-audio-result__mime">{{ mime }}</span>
		</h4>

		<p v-if="label">
			{{ label }}
		</p>
	</div>
</template>

<script>
/**
 * @file AudioResult.vue
 *
 * Audio-specific search result layout. Implements the general searchResult
 * mixin as well as the "time-based" result mixin.
 */
const searchResult = require( '../../mixins/searchResult.js' ),
	searchResultTimeBased = require( '../../mixins/searchResultTimeBased.js' );

const { CdxIcon } = require( '@wikimedia/codex' );
const { cdxIconVolumeUp } = require( '../icons.json' );

// @vue/component
module.exports = exports = {
	name: 'AudioResult',

	components: {
		CdxIcon
	},

	mixins: [ searchResult, searchResultTimeBased ],

	inheritAttrs: false,

	data: function () {
		return {
			cdxIconVolumeUp
		};
	}
};
</script>
