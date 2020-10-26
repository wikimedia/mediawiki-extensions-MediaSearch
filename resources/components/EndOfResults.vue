<template>
	<div class="sdms-end-of-results">
		<p>
			{{ $i18n( 'mediasearch-end-of-results' ) }}
			<span class="sdms-no-results__tips">
				{{ $i18n( 'mediasearch-end-of-results-tips' ) }}
			</span>
		</p>
	</div>
</template>

<script>
/**
 * @file EndOfResults.vue
 *
 * A visual "end of results" message
 */

// @vue/component
module.exports = {
	name: 'EndOfResults'
};
</script>
