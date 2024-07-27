<template>
	<div
		v-if="didYouMean"
		v-i18n-html:mediasearch-did-you-mean="[ didYouMeanLink ]"
		class="sdms-did-you-mean">
	</div>
</template>

<script>
const { mapState } = require( 'vuex' );

/**
 * Search suggestion.
 */
// @vue/component
module.exports = exports = {
	name: 'DidYouMean',

	computed: Object.assign( {}, mapState( [
		'didYouMean'
	] ), {

		/**
		 * Generate a link to the suggested search term using mw.Uri
		 *
		 * @return {HTMLElement}
		 */
		didYouMeanLink: function () {
			const linkNode = document.createElement( 'a' );
			const url = new mw.Uri();

			url.query.search = this.didYouMean;
			linkNode.href = url.toString();
			linkNode.appendChild( document.createTextNode( this.didYouMean ) );

			return linkNode;
		}
	} )
};
</script>
