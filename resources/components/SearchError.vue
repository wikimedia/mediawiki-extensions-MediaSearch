<template>
	<div class="sdms-error">
		<div class="sdms-error__icon"></div>

		<p>
			{{ $i18n( 'mediasearch-error-message' ).text() }}
			<!-- eslint-disable vue/no-v-html -->
			<span v-if="hasApiError" class="sdms-error__message"
				v-html="errorMsgHtml">
			</span>
			<!-- eslint-enable vue/no-v-html -->
			<span v-else class="sdms-error__message">
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
const initialResults = mw.config.get( 'sdmsInitialSearchResults' );

// @vue/component
module.exports = {
	name: 'SearchError',

	data: function () {
		return {
			hasApiError: initialResults.hasApiError,
			errorMsgHtml: initialResults.apiErrorMsgHtml
		};
	}
};
</script>
