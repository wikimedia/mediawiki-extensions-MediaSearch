const Vue = require( 'vue' );
const VueTestUtils = require( '@vue/test-utils' );
const Select = require( '../../../../resources/components/base/Select.vue' );

const FRUITS = [ {
	label: 'Apple',
	value: 'apple'
}, {
	label: 'Banana',
	value: 'banana'
}, {
	label: 'Pear',
	value: 'pear'
}, {
	label: 'Strawberry',
	value: 'strawberry'
} ];

describe( 'Select', () => {
	describe( 'when provided with an array of items that have "label" and "value" properties', () => {
		it( 'displays the label if no initial selection is specified', () => {
			const defaultLabel = 'select a fruit';
			const wrapper = VueTestUtils.mount( Select, {
				propsData: {
					name: 'fruits',
					label: defaultLabel,
					items: FRUITS
				}
			} );
			expect( wrapper.text() ).toBe( defaultLabel );
		} );

		it( 'displays the label of the selected item if initial selection is specified', () => {
			const index = 2;
			const wrapper = VueTestUtils.mount( Select, {
				propsData: {
					name: 'fruits',
					label: 'select a fruit',
					items: FRUITS,
					initialSelectedItemIndex: index
				}
			} );

			expect( wrapper.find( 'button' ).text() ).toBe( FRUITS[ index ].label );
		} );

		it( 'displays an optional prefix with the selected value if one is provided', () => {
			const index = 1;
			const prefix = 'Fruit: ';
			const wrapper = VueTestUtils.mount( Select, {
				propsData: {
					name: 'fruits',
					label: 'select a fruit',
					items: FRUITS,
					initialSelectedItemIndex: index,
					prefix: prefix
				}
			} );
			expect( wrapper.text() ).toContain( prefix );
			expect( wrapper.text() ).toContain( FRUITS[ index ].label );
		} );

		it( 'allows items to be selected via the select method', ( done ) => {
			const selection = 'strawberry';
			const index = 2;
			const wrapper = VueTestUtils.mount( Select, {
				propsData: {
					name: 'fruits',
					label: 'select a fruit',
					items: FRUITS,
					initialSelectedItemIndex: index
				}
			} );

			wrapper.vm.select( selection );
			Vue.nextTick().then( () => {
				expect( wrapper.find( 'button' ).text() ).toBe( 'Strawberry' );
				done();
			} );
		} );

		it( 'throws an error if the specified item is not found', () => {
			const selection = 'kiwi';
			const index = 2;
			const wrapper = VueTestUtils.mount( Select, {
				propsData: {
					name: 'fruits',
					label: 'select a fruit',
					items: FRUITS,
					initialSelectedItemIndex: index
				}
			} );

			expect( () => {
				wrapper.vm.select( selection );
			} ).toThrow();
		} );

		it( 'computes valid item length', () => {
			const defaultLabel = 'select a fruit';
			const wrapper = VueTestUtils.mount( Select, {
				propsData: {
					name: 'fruits',
					label: defaultLabel,
					items: FRUITS
				}
			} );
			expect( wrapper.vm.itemsLength ).toBe( FRUITS.length );
		} );
	} );

	describe( 'when interacting with the dropdown', () => {

		it( 'shows a dropdown menu when select is clicked', () => {

			const wrapper = VueTestUtils.mount( Select, {
				propsData: {
					name: 'fruits',
					label: 'select a fruit',
					items: FRUITS
				}
			} );

			wrapper.find( '.sd-select__content' ).trigger( 'click' );

			expect( wrapper.vm.showMenu ).toBe( true );
		} );

		it( 'shows a dropdown menu when enter is pressed on the select element', () => {

			const wrapper = VueTestUtils.mount( Select, {
				propsData: {
					name: 'fruits',
					label: 'select a fruit',
					items: FRUITS
				}
			} );

			wrapper.find( '.sd-select__content' ).trigger( 'keyup.enter' );

			expect( wrapper.vm.showMenu ).toBe( true );
		} );

		it( 'it has no active item if none has been defined', () => {

			const wrapper = VueTestUtils.mount( Select, {
				propsData: {
					name: 'fruits',
					label: 'select a fruit',
					items: FRUITS
				}
			} );

			wrapper.find( '.sd-select__content' ).trigger( 'click' );

			expect( wrapper.vm.activeItemIndex ).toBe( -1 );
		} );

		it( 'it has active state preset to the provided value', () => {

			const index = 2;
			const wrapper = VueTestUtils.mount( Select, {
				propsData: {
					name: 'fruits',
					label: 'select a fruit',
					items: FRUITS,
					initialSelectedItemIndex: index
				}
			} );

			wrapper.find( '.sd-select__content' ).trigger( 'click' );

			expect( wrapper.vm.activeItemIndex ).toBe( index );
		} );

		it( 'it has selected value preset to the provided value', () => {

			const index = 2;
			const wrapper = VueTestUtils.mount( Select, {
				propsData: {
					name: 'fruits',
					label: 'select a fruit',
					items: FRUITS,
					initialSelectedItemIndex: index
				}
			} );

			wrapper.find( '.sd-select__content' ).trigger( 'click' );

			expect( wrapper.vm.selectedItemIndex ).toBe( index );
		} );

		it( 'it closes the menu when a value is selected', () => {

			const selectionId = 1;
			const wrapper = VueTestUtils.mount( Select, {
				propsData: {
					name: 'fruits',
					label: 'select a fruit',
					items: FRUITS
				}
			} );

			wrapper.find( '.sd-select__content' ).trigger( 'click' );
			expect( wrapper.vm.showMenu ).toBe( true );

			// we are triggering the method directly, to avoid "cross testing"
			// of nested components
			wrapper.vm.onSelect( selectionId, FRUITS[ selectionId ] );
			expect( wrapper.vm.showMenu ).toBe( false );
		} );

		it( 'it closes the menu on blur', () => {

			const wrapper = VueTestUtils.mount( Select, {
				propsData: {
					name: 'fruits',
					label: 'select a fruit',
					items: FRUITS
				}
			} );

			wrapper.find( '.sd-select__content' ).trigger( 'click' );
			expect( wrapper.vm.showMenu ).toBe( true );

			wrapper.find( '.sd-select__content' ).trigger( 'blur' );
			expect( wrapper.vm.showMenu ).toBe( false );
		} );

		it( 'it emit a "select" message when an item is clicked', () => {

			const selectionId = 1;
			const wrapper = VueTestUtils.mount( Select, {
				propsData: {
					name: 'fruits',
					label: 'select a fruit',
					items: FRUITS
				}
			} );

			// we are triggering the method directly, to avoid "cross testing"
			// of nested components
			wrapper.vm.onSelect( selectionId, FRUITS[ selectionId ] );

			const expectedEmittedValue = FRUITS[ selectionId ].value;
			expect( wrapper.emitted().select[ 0 ][ 0 ] ).toBe( expectedEmittedValue );
		} );

		it( 'it set active state to selected index when reopening menu with click', () => {

			const selectionId = 2;
			const wrapper = VueTestUtils.mount( Select, {
				propsData: {
					name: 'fruits',
					label: 'select a fruit',
					items: FRUITS,
					initialSelectedItemIndex: selectionId
				}
			} );

			// we are triggering the method directly, to avoid "cross testing"
			// of nested components
			const newSelectionId = 1;
			wrapper.vm.onSelect( newSelectionId, FRUITS[ newSelectionId ] );

			// open the menu again
			wrapper.find( '.sd-select__content' ).trigger( 'click' );

			expect( wrapper.vm.activeItemIndex ).toBe( newSelectionId );
		} );

		it( 'it set active state to selected index when reopening menu with enter', () => {

			const selectionId = 2;
			const wrapper = VueTestUtils.mount( Select, {
				propsData: {
					name: 'fruits',
					label: 'select a fruit',
					items: FRUITS,
					initialSelectedItemIndex: selectionId
				}
			} );

			// we are triggering the method directly, to avoid "cross testing"
			// of nested components
			const newSelectionId = 1;
			wrapper.vm.onSelect( newSelectionId, FRUITS[ newSelectionId ] );

			// open the menu again
			wrapper.find( '.sd-select__content' ).trigger( 'keyup.enter' );

			expect( wrapper.vm.activeItemIndex ).toBe( newSelectionId );

		} );

		it( 'it default active state to the selected when menu is reopened', () => {

			const initialSelectionIndex = 2;
			const wrapper = VueTestUtils.mount( Select, {
				propsData: {
					name: 'fruits',
					label: 'select a fruit',
					items: FRUITS,
					initialSelectedItemIndex: initialSelectionIndex
				}
			} );

			// emulate hovering out of the menu, by setting active to an non existing value
			const newSelectionId = -1;
			wrapper.vm.onActiveItemChange( newSelectionId );

			// open the menu again
			wrapper.find( '.sd-select__content' ).trigger( 'click' );

			expect( wrapper.vm.activeItemIndex ).toBe( initialSelectionIndex );

		} );

		it( 'it toggle menu off when activeItemIndex is empty and showMenu is true', () => {

			const initialSelectionIndex = -1;
			const wrapper = VueTestUtils.shallowMount( Select, {
				propsData: {
					name: 'fruits',
					label: 'select a fruit',
					items: FRUITS,
					initialSelectedItemIndex: initialSelectionIndex
				},
				data: function () {
					return {
						showMenu: true
					};
				}
			} );

			const mockToggleMenu = jest.spyOn( wrapper.vm, 'toggleMenu' );
			mockToggleMenu.mockImplementation( () => jest.fn() );

			const element = wrapper.find( '.sd-select__content' );

			element.trigger( 'keyup.enter' );

			expect( mockToggleMenu ).toHaveBeenCalled();

		} );

		it( 'emits "select" when activeItemIndex is empty and showMenu is true', ( done ) => {

			const initialSelectionIndex = 2;
			const wrapper = VueTestUtils.shallowMount( Select, {
				propsData: {
					name: 'fruits',
					label: 'select a fruit',
					items: FRUITS,
					initialSelectedItemIndex: initialSelectionIndex
				},
				data: function () {
					return {
						showMenu: true
					};
				}
			} );
			const element = wrapper.find( '.sd-select__content' );

			element.trigger( 'keyup.enter' );

			Vue.nextTick().then( () => {
				expect( wrapper.emitted().select ).toHaveLength( 1 );
				done();
			} );

		} );

	} );

} );
