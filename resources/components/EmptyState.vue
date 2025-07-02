<template>
	<div v-if="fileCount" class="sdms-empty-state">
		<div class="sdms-empty-state__icon"></div>

		<p>{{ message }}</p>
	</div>
</template>

<script>
/**
 * @file EmptyState.vue
 *
 * A visual "empty state" containing a message that is displayed to the user
 * when no search term has been provided.
 */
const fileCount = mw.config.get( 'sdmsTotalSiteImages' );

// @vue/component
module.exports = exports = {
	name: 'EmptyState',

	compatConfig: {
		MODE: 3
	},

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
