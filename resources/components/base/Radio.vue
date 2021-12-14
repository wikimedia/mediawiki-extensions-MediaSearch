<template>
	<label
		ref="label"
		class="sd-radio"
		:aria-disabled="disabled"
		@click="onClick"
		@keydown.prevent.enter="onEnter"
	>
		<input
			ref="input"
			v-model="computedValue"
			class="sd-radio__input"
			type="radio"
			:name="name"
			:value="inputValue"
			:aria-disabled="disabled"
			:disabled="disabled"
		>
		<span class="sd-radio__icon" :aria-disabled="disabled"></span>
		<span class="sd-radio__spacer"></span>
		<span class="sd-radio__label-text">
			<slot></slot>
		</span>
	</label>
</template>

<script>
var binaryInput = require( './mixins/binaryInput.js' );

/**
 * Radio input.
 */
// @vue/component
module.exports = {
	name: 'SdRadio',

	mixins: [ binaryInput ],

	props: {
		/**
		 * Name of the radio group.
		 */
		name: {
			type: String,
			default: ''
		}
	},

	methods: {
		onEnter: function () {
			this.$refs.label.click();
		}
	}
};
</script>
