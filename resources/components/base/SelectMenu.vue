<template>
	<div class="sd-select-menu">
		<ul
			:id="listboxId"
			class="sd-select-menu__list"
			role="listbox"
			:aria-labelledby="labelledBy"
		>
			<li
				v-for="( item, index ) in formattedItems"
				:id="listboxId + '-item-' + index"
				:key="listboxId + '-item-' + index"
				class="sd-select-menu__list-item"
				:class="getItemClasses( index )"
				role="option"
				:aria-selected="isActiveItem( index ) || null"
				@mousedown="onMousedown( index, item )"
				@mouseover="$emit( 'active-item-change', index )"
				@mouseleave="$emit( 'active-item-change', -1 )"
			>
				{{ item.label }}
			</li>
		</ul>
	</div>
</template>

<script>
/**
 * @file SelectMenu
 *
 * List of items that informs the parent component when an item is clicked.
 * Receives the index of the active item from parent so a visual indication can
 * be applied via CSS here.
 *
 * On hover, active item index is emitted to the parent. On mouse leave, the
 * index is reset to -1 (i.e. no active item).
 */
// @vue/component
module.exports = exports = {
	name: 'SelectMenu',

	props: {
		/**
		 * Items can come in 3 formats:
		 * 1. An array of strings
		 *    Example: [ 'Apple', 'Banana', 'Orange' ]
		 * 2. An array of objects with label and value keys
		 *    Example: [ {label: 'Apple', value: 'a'}, {label: 'Banana', value: 'b'} ]
		 * 3. An object of simple key:string pairs
		 *    Example: {a: 'Apple', b: 'Banana', c: 'Carrot'}
		 */
		items: {
			type: [ Array, Object ],
			default: function () {
				return [ ];
			}
		},

		/**
		 * Index of the item the user is (figuratively) focused on.
		 */
		activeItemIndex: {
			type: Number,
			default: 0
		},

		/**
		 * Index of the currently selected item. This prop will only exist for
		 * parent components like a select list, since the item list persists.
		 */
		selectedItemIndex: {
			type: Number,
			default: -1
		},

		listboxId: {
			type: String,
			required: true
		},

		labelledBy: {
			type: String,
			default: null
		}
	},

	emits: [
		'active-item-change',
		'select'
	],

	computed: {
		/**
		 * @return {Array} Array of objects with label and value keys
		 */
		formattedItems: function () {
			return this.getFormattedItems( this.items );
		}
	},

	methods: {
		/**
		 * Handle mousedown.
		 *
		 * @param {number} index
		 * @param {Object} item
		 * @fires select
		 */
		onMousedown: function ( index, item ) {
			// If this is the selected item, do nothing.
			if ( index === this.selectedItemIndex ) {
				return;
			}

			this.$emit( 'select', index, item );
		},

		/**
		 * Determine if a list item should have the active class.
		 *
		 * @param {number} index
		 * @return {boolean}
		 */
		isActiveItem: function ( index ) {
			// If activeItemIndex is unset (-1), we select the first item of the list.
			const activeItem = this.activeItemIndex === -1 ? 0 : this.activeItemIndex;
			return index === activeItem;
		},

		/**
		 * Determine if a list item should have the selected class.
		 *
		 * @param {number} index
		 * @return {boolean}
		 */
		isSelectedItem: function ( index ) {
			// If selectedItem is unset (-1), we select the first item of the list.
			const itemToSelect = this.selectedItemIndex === -1 ? 0 : this.selectedItemIndex;
			return index === itemToSelect;
		},

		getItemClasses: function ( index ) {
			return {
				'sd-select-menu__list-item--active': this.isActiveItem( index ),
				'sd-select-menu__list-item--selected': this.isSelectedItem( index )
			};
		},

		/**
		 * Format items prop.
		 *
		 * Items can be provided in a variety of formats. We need to process
		 * them into a single format to be used in the template.
		 *
		 * @param {Array|Object} items
		 * @return {Array} Array of objects with label and value keys
		 */
		getFormattedItems: function ( items ) {
			let keys;

			// Handle array of strings.
			if (
				Array.isArray( items ) &&
				items.length &&
				typeof items[ 0 ] === 'string'
			) {
				return items.map( ( item ) => ( {
					label: item,
					value: item
				} ) );
			}

			// Handle array of objects.
			if (
				Array.isArray( items ) &&
				items.length &&
				typeof items[ 0 ] === 'object'
			) {
				return items.map( ( item ) => {
					if ( 'label' in item && 'value' in item ) {
						return item;
					}

					return false;
				} );
			}

			// Handle object.
			if ( typeof items === 'object' ) {
				keys = Object.keys( items );
				return keys.map( ( key ) => ( {
					label: items[ key ],
					value: key
				} ) );
			}

			throw new Error( 'Passed value format is not supported' );
		}
	}
};
</script>
