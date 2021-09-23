<template>
	<!-- eslint-disable vue/no-v-html -->
	<div v-if="didYouMean"
		class="sdms-did-you-mean">
		<a :href="didYouMeanLink">{{ didYouMeanMessage }}</a>
	</div>
	<!-- eslint-enable vue/no-v-html -->
</template>

<script>
var mapState = require( 'vuex' ).mapState;

/**
 * Search suggestion.
 *
 * v-html use: didYouMeanMessage is a message whose params come from trusted
 * API content.
 */
// @vue/component
module.exports = {
	name: 'DidYouMean',

	computed: $.extend( {}, mapState( [
		'didYouMean'
	] ), {

		/**
		 * Generate a link to the suggested search term using mw.Uri
		 *
		 * @return {string}
		 */
		didYouMeanLink: function () {
			var url = new mw.Uri();
			url.query.search = this.didYouMean;

			return url.toString();
		},

		/**
		 * When passing multiple params to a message it's typically cleaner to
		 * do everything in a computed property rather than trying to cramm it
		 * all into the template
		 *
		 * @return {string} String containing HTML
		 */
		didYouMeanMessage: function () {
			return this.$i18n( 'mediasearch-did-you-mean' )
				.params( [ this.didYouMean ] )
				.text();
		}
	} )
};
</script>
