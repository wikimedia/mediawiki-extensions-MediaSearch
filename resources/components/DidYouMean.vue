<template>
	<div v-if="didYouMean"
		v-i18n-html:mediasearch-did-you-mean="[ didYouMeanLink ]"
		class="sdms-did-you-mean">
	</div>
</template>

<script>
var mapState = require( 'vuex' ).mapState;

/**
 * Search suggestion.
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
		 * @return {HTMLElement}
		 */
		didYouMeanLink: function () {
			var linkNode = document.createElement( 'a' ),
				url = new mw.Uri();
			url.query.search = this.didYouMean;
			linkNode.href = url.toString();
			linkNode.appendChild( document.createTextNode( this.didYouMean ) );
			return linkNode;
		}
	} )
};
</script>
