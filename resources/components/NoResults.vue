<template>
	<div class="sdms-no-results">
		<div class="sdms-no-results__icon"></div>

		<p>
			{{ $i18n( 'mediasearch-no-results' ) }}
			<span class="sdms-no-results__tips">
				{{ $i18n( 'mediasearch-no-results-tips' ) }}
			</span>
		</p>
	</div>
</template>

<script>
/**
 * @file NoResults.vue
 *
 * A visual "no results" message
 */

// @vue/component
module.exports = {
	name: 'NoResults'
};
</script>
