<template>
	<transition name="sd-tab-fade-in">
		<div
			v-show="isActive"
			:id="id"
			:aria-hidden="!isActive"
			:aria-labeledby="id + '-label'"
			class="sd-tab"
			role="tabpanel"
		>
			<slot></slot>
		</div>
	</transition>
</template>

<script>
/**
 * A single tab, to be used inside a Tabs component. See App for usage example.
 */
// @vue/component
module.exports = {
	name: 'SdTab',
	props: {
		name: {
			type: String,
			required: true
		},

		title: {
			type: String,
			required: true
		},

		disabled: {
			type: Boolean
		}
	},

	data: function () {
		return {
			isActive: false
		};
	},

	computed: {
		id: function () {
			return 'sd-tab-' + this.name;
		}
	}
};
</script>
