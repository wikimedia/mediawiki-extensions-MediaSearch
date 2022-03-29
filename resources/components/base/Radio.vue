<template>
	<label
		ref="label"
		class="sd-radio"
		:aria-disabled="disabled || null"
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
			:aria-disabled="disabled || null"
			:disabled="disabled || null"
		>
		<span class="sd-radio__icon" :aria-disabled="disabled || null"></span>
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
module.exports = exports = {
	name: 'SdRadio',

	compatConfig: {
		ATTR_FALSE_VALUE: true
	},

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
