<template>
	<label
		ref="label"
		class="sd-checkbox"
		:aria-disabled="disabled"
		@click="onClick"
		@keydown.prevent.enter="onEnter"
	>
		<input
			ref="input"
			v-model="computedValue"
			class="sd-checkbox__input"
			type="checkbox"
			:value="inputValue"
			:aria-disabled="disabled"
			:disabled="disabled"
		>
		<span class="sd-checkbox__icon" :aria-disabled="disabled"></span>
		<span class="sd-checkbox__spacer"></span>
		<span class="sd-checkbox__label-text">
			<slot></slot>
		</span>
	</label>
</template>

<script>
var binaryInput = require( './mixins/binaryInput.js' );

/**
 * Checkbox input.
 */
// @vue/component
module.exports = {
	name: 'SdCheckbox',

	mixins: [ binaryInput ],

	methods: {
		onEnter: function () {
			this.$refs.label.click();
		}
	}
};
</script>
