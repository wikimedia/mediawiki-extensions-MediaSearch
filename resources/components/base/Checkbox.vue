<template>
	<label
		ref="label"
		class="sd-checkbox"
		:aria-disabled="disabled || null"
		@click="onClick"
		@keydown.prevent.enter="onEnter"
	>
		<input
			ref="input"
			v-model="computedValue"
			class="sd-checkbox__input"
			type="checkbox"
			:value="inputValue"
			:aria-disabled="disabled || null"
			:disabled="disabled || null"
		>
		<span class="sd-checkbox__icon" :aria-disabled="disabled || null"></span>
		<span class="sd-checkbox__spacer"></span>
		<span class="sd-checkbox__label-text">
			<slot></slot>
		</span>
	</label>
</template>

<script>
const binaryInput = require( './mixins/binaryInput.js' );

/**
 * Checkbox input.
 */
// @vue/component
module.exports = exports = {
	name: 'SdCheckbox',

	compatConfig: {
		COMPONENT_V_MODEL: false
	},

	mixins: [ binaryInput ],

	methods: {
		onEnter: function () {
			this.$refs.label.click();
		}
	}
};
</script>
