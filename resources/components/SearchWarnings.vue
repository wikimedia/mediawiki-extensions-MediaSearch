<template>
	<div
		v-if="warningMessage"
		class="cdx-message cdx-message--warning cdx-message--block">
		<span class="cdx-message__icon"></span>
		<div class="cdx-message__content">
			<p>{{ warningMessage }}</p>
		</div>
	</div>
</template>

<script>
const { mapState } = require( 'vuex' );

/**
 * Search warnings.
 */
// @vue/component
module.exports = exports = {
	name: 'SearchWarnings',

	computed: Object.assign( {}, mapState( [
		'searchWarnings'
	] ), {

		/**
		 * The warning message to be issued.
		 *
		 * @return {String}
		 */
		warningMessage: function () {
			return this.searchWarnings;
		}
	} )
};
</script>
