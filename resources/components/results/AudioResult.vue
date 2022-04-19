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
				@click="showDetails"
			>
				{{ displayName }}
			</a>
		</h3>

		<h4 class="sdms-audio-result__meta">
			<span class="sdms-audio-result__duration">
				<sd-icon :icon="icon"></sd-icon>
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
var searchResult = require( '../../mixins/searchResult.js' ),
	searchResultTimeBased = require( '../../mixins/searchResultTimeBased.js' ),
	SdIcon = require( '../base/Icon.vue' ),
	icons = require( '../../../lib/icons.js' );

// @vue/component
module.exports = exports = {
	name: 'AudioResult',

	components: {
		'sd-icon': SdIcon
	},

	mixins: [ searchResult, searchResultTimeBased ],

	inheritAttrs: false,

	data: function () {
		return {
			icon: icons.sdIconVolumeUp
		};
	}
};
</script>
