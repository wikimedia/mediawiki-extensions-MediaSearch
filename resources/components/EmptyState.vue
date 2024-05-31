<template>
	<div v-if="fileCount" class="sdms-empty-state">
		<div class="sdms-empty-state__icon"></div>

		<!-- eslint-disable-next-line vue/no-v-html-->
		<p v-html="message"></p>
	</div>
</template>

<script>
/**
 * @file EmptyState.vue
 *
 * A visual "empty state" containing a message that is displayed to the user
 * when no search term has been provided.
 *
 * v-html use: this is a message whose param comes from trusted API content.
 */
const fileCount = mw.config.get( 'sdmsTotalSiteImages' );

// @vue/component
module.exports = exports = {
	name: 'EmptyState',

	data: function () {
		return {
			fileCount: fileCount
		};
	},

	computed: {
		message: function () {
			return mw.msg( 'mediasearch-empty-state', this.fileCount );
		}
	}
};
</script>
