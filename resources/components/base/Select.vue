<template>
	<div class="sd-select" :class="rootClasses">
		<label :id="listboxId" class="sd-select__sr-only">{{ selectLabel }}</label>
		<button
			ref="sdSelectButton"
			class="sd-select__content"
			tabindex="0"
			aria-autocomplete="list"
			aria-haspopup="listbox"
			:aria-owns="listboxId"
			:aria-labelledby="listboxId + ' ' + textboxId"
			:aria-expanded="isExpanded"
			:aria-activedescendant="activeItemId || null"
			:aria-disabled="disabled || null"
			@click="onClick"
			@blur="onBlur"
			@mousedown="isMouseDown = true"
			@mouseup="isMouseDown = false"
			@keydown.enter.prevent
			@keyup.enter="onEnter"
			@keydown.up.prevent="onArrowUp"
			@keydown.down.prevent="onArrowDown"
		>
			<span
				:id="textboxId"
				class="sd-select__current-selection"
				role="textbox"
				aria-readonly="true"
			>
				<template v-if="isListItemSelected">
					{{ prefix }}
				</template>
				{{ currentSelection }}
			</span>
			<cdx-icon class="sd-select__handle" :icon="cdxIconExpand" size="x-small">
			</cdx-icon>
		</button>
		<sd-select-menu
			v-if="showMenu"
			:items="items"
			:active-item-index="activeItemIndex"
			:selected-item-index="selectedItemIndex"
			:listbox-id="listboxId"
			@select="onSelect"
			@active-item-change="onActiveItemChange"
		>
		</sd-select-menu>
	</div>
</template>

<script>
const SelectMenu = require( './SelectMenu.vue' );
const { CdxIcon } = require( '@wikimedia/codex' );
const { cdxIconExpand } = require( '../icons.json' );

/**
 * @file Select
 *
 * Select component with SelectMenu dropdown.
 *
 * This component takes a set of items as a prop and passes those items to the
 * SelectMenu component for display. This component controls when the menu is
 * shown, shows the selected item if there is one, and emits the selected item
 * value to the parent.
 */
// @vue/component
module.exports = exports = {
	name: 'SdSelect',

	compatConfig: {
		MODE: 3
	},

	components: {
		CdxIcon,
		'sd-select-menu': SelectMenu
	},

	props: {
		/**
		 * Name must be provided to ensure unique aria attributes. Should be a
		 * valid as a CSS id.
		 */
		name: {
			type: String,
			required: true
		},

		/**
		 * Displayed when no item is selected. If omitted, the first item will
		 * be selected and displayed initially (or the selected item is one is
		 * provided as a prop). MW Message objects are allowed.
		 */
		label: {
			type: [ String, Object ],
			default: null
		},

		/** Items should be an array of objects with "label" and "value" properties */
		items: {
			type: [ Array ],
			required: true
		},

		/**
		 * If an item should be selected on component mount, the selected item
		 * index can be included via this prop.
		 */
		initialSelectedItemIndex: {
			type: Number,
			default: -1
		},

		disabled: {
			type: Boolean
		},

		/**
		 * Prefix will be shown before the selected value, e.g. "Sort by:"
		 * MW Message objects are allowed.
		 */
		prefix: {
			type: [ String, Object ],
			default: ''
		}
	},

	data: function () {
		return {
			showMenu: false,
			isMouseDown: false,
			activeItemIndex: this.initialSelectedItemIndex,
			selectedItemIndex: this.initialSelectedItemIndex,
			cdxIconExpand
		};
	},

	computed: {
		/**
		 * @return {boolean}
		 */
		isListItemSelected: function () {
			return this.selectedItemIndex > -1;
		},

		/**
		 * This helps to figure out what text to show as label for accessibility
		 *
		 * @return {string}
		 */
		selectLabel: function () {
			// We show the label, if an item is selected,
			// because it would be label will removed from the button
			if ( this.isListItemSelected ) {
				return this.label;
			} else if ( !this.label ) {
				// We show the prefix as the label,
				// if no label is passed and no item is selected
				return this.prefix;
			}

			return '';
		},

		/**
		 * @return {string} The user-visible label for the current selection
		 */
		currentSelection: function () {
			if ( this.selectedItemIndex === -1 ) {
				return this.label;
			} else {
				return this.items[ this.selectedItemIndex ].label;
			}
		},

		/**
		 * @return {Object}
		 */
		rootClasses: function () {
			return {
				'sd-select--open': this.showMenu,
				'sd-select--disabled': this.disabled,
				// This class can be used by other components (e.g. Tabs) to
				// style component differently depending on whether or not a
				// value has been selected.
				'sd-select--value-selected': this.selectedItemIndex > -1
			};
		},

		/**
		 * For the aria-expanded attribute of the input, we need to use strings
		 * instead of booleans so that aria-expanded will be set to "false" when
		 * appropriate rather than the attribute being omitted, which is what
		 * would happen if we used a boolean false.
		 *
		 * @return {string}
		 */
		isExpanded: function () {
			return this.showMenu ? 'true' : 'false';
		},

		/**
		 * @return {string}
		 */
		textboxId: function () {
			return this.name + '__textbox';
		},

		/**
		 * @return {string}
		 */
		listboxId: function () {
			return this.name + '__listbox';
		},

		/**
		 * The ID of the element of the active menu item.
		 *
		 * @return {string|boolean}
		 */
		activeItemId: function () {
			return this.activeItemIndex > -1 ?
				this.listboxId + '-item-' + this.activeItemIndex :
				false;
		},

		/**
		 * @return {number} Number of items
		 */
		itemsLength: function () {
			return this.items.length;
		}
	},

	methods: {
		/**
		 * Toggle menu state on click.
		 */
		onClick: function () {
			this.toggleMenu( !this.showMenu );
			this.restoreActiveItemIndex();
			if ( this.showMenu ) {
				this.$refs.sdSelectButton.focus();
			}
		},

		onBlur: function () {
			/**
			 * Check if the blur event isn't triggered by a click on the menu, because it breaks on Safari
			 */
			if ( !this.isMouseDown ) {
				this.toggleMenu( false );
			}
		},

		/**
		 * Handle enter keypress.
		 *
		 * @fires select
		 * @return {void}
		 */
		onEnter: function () {
			var value;

			// If the menu is hidden, show it.
			if ( !this.showMenu ) {
				this.toggleMenu( true );
				this.restoreActiveItemIndex();
				return;
			}

			// If the menu is showing but there's no active item, close the menu.
			if ( this.activeItemIndex < 0 ) {
				this.toggleMenu( false );
				return;
			}

			// Otherwise:
			// - Show the selected item in the content box
			// - Store the selected item index so it can be styled as such if
			//   the menu is reopened
			// - Emit the selected item to the parent
			// - Hide the menu
			value = this.items[ this.activeItemIndex ].value;
			this.selectedItemIndex = this.activeItemIndex;
			this.$emit( 'select', value );
			this.toggleMenu( false );
		},

		/**
		 * Handle item click.
		 *
		 * @param {number} index
		 * @param {Object} item
		 * @param {string} item.label Selected item's human-readable label
		 * @param {string} item.value Selected item's value
		 * @fires submit
		 */
		onSelect: function ( index, item ) {
			this.activeItemIndex = index;
			this.selectedItemIndex = index;
			this.$emit( 'select', item.value );
			this.toggleMenu( false );
		},

		/**
		 * Move to the next item.
		 * If we're at the end go back to the first item.
		 * if activeItem is -1 go to second item (this is because we pre-select the first item )
		 */
		onArrowDown: function () {
			var index = this.activeItemIndex,
				isNotLastItem = this.itemsLength > index + 1,
				isUnselectedMenu = index === -1;

			if ( isUnselectedMenu ) {
				this.activeItemIndex = 1;
			} else if ( isNotLastItem ) {
				this.activeItemIndex = index + 1;
			} else {
				this.activeItemIndex = 0;
			}
		},

		/**
		 * Move to the previous item. If we're at the beginning, go to
		 * the last item.
		 */
		onArrowUp: function () {
			var index = this.activeItemIndex;
			// Do nothing if there is no active item yet.
			if ( index > -1 ) {
				this.activeItemIndex = index === 0 ? this.itemsLength - 1 : index - 1;
			}
		},

		/**
		 * Change the active item index based on mouseover or mouseleave.
		 *
		 * @param {number} index
		 */
		onActiveItemChange: function ( index ) {
			this.activeItemIndex = index;
		},

		/**
		 * Set menu visibility.
		 *
		 * @param {boolean} show
		 * @return {void}
		 */
		toggleMenu: function ( show ) {
			if ( this.disabled ) {
				return;
			}

			this.showMenu = show;
		},

		/**
		 * Programmatically set the selection if it has been changed by means
		 * other than direct user interaction. Changes made in this way should
		 * never emit "select" events.
		 *
		 * @param {string} selection value of the item to be selected
		 * @throws error if specified value does not exist
		 */
		// eslint-disable-next-line vue/no-unused-properties
		select: function ( selection ) {
			var selectionIndex;

			selectionIndex = this.items.findIndex( function ( item ) {
				return item.value === selection;
			} );

			if ( selectionIndex && selectionIndex >= 0 ) {
				this.selectedItemIndex = selectionIndex;
				this.activeItemIndex = selectionIndex;
			} else {
				throw new Error( 'specified value does not exist' );
			}
		},

		/**
		 * Reset the component to initial values for selection index and
		 * user-visible label
		 */
		// eslint-disable-next-line vue/no-unused-properties
		reset: function () {
			this.selectedItemIndex = this.initialSelectedItemIndex;
			this.activeItemIndex = this.initialSelectedItemIndex;
		},

		/**
		 * Restore the ActiveItemIndex to be equal to the selectedItemIndex
		 * This is usually needed to make sure that when the dropdowns is open
		 * it activate the selected Item
		 */
		restoreActiveItemIndex: function () {
			this.activeItemIndex = this.selectedItemIndex;
		}
	}
};
</script>
