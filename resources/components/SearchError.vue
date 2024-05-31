<template>
	<div class="sdms-error">
		<div class="sdms-error__icon"></div>

		<p>
			{{ $i18n( 'mediasearch-error-message' ).text() }}
			<span class="sdms-error__message">
				{{ $i18n( 'mediasearch-error-text' ).text() }}
			</span>
		</p>
	</div>
</template>

<script>
/**
 * @file SearchError.vue
 *
 * A visual "invalid search" message
 */

// @vue/component
module.exports = {
	name: 'SearchError'
};
</script>
