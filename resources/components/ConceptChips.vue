<template>
	<div class="sdms-concept-chips">
		<sd-button
			v-for="concept in concepts"
			:key="concept"
			class="sdms-concept-chips__button"
			@click="$emit( 'concept-select', concept)"
		>
			{{ concept }}
		</sd-button>
	</div>
</template>

<script>
/**
 * @file ConceptChips.vue
 *
 * Set of buttons representing concept chips for a given search term. On click,
 * the concept chip label is emitted to the parent App component so it can
 * update the search term in state and perform a new search.
 */
var SdButton = require( './base/Button.vue' );

// @vue/component
module.exports = {
	name: 'ConceptChips',

	components: {
		'sd-button': SdButton
	},

	props: {
		mediaType: {
			type: String,
			required: true
		},

		concepts: {
			type: Array,
			required: true
		}
	}
};
</script>
