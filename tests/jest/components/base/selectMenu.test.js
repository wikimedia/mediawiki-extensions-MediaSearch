const VueTestUtils = require( '@vue/test-utils' ),
	SelectMenu = require( '../../../../resources/components/base/SelectMenu.vue' ),
	FRUITS = [ {
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
	} ],
	LISTBOXID = 'fruits';

describe( 'SelectMenu', () => {

	describe( 'onMousedown', () => {

		it( 'if item is currently selected, no event emitted', () => {

			const selectedItemIndex = 0;
			const wrapper = VueTestUtils.mount( SelectMenu, {
				propsData: {
					listboxId: LISTBOXID,
					labelledBy: 'select a fruit',
					items: FRUITS,
					selectedItemIndex
				}
			} );

			wrapper.find( '#' + LISTBOXID + '-item-' + selectedItemIndex ).trigger( 'mousedown' );

			expect( wrapper.emitted().select ).toBeUndefined();
		} );

		it( 'if item is not currently selected emit select event with formatted items', () => {

			const selectedItemIndex = 1;
			const itemIndex = 0;
			const wrapper = VueTestUtils.mount( SelectMenu, {
				propsData: {
					listboxId: LISTBOXID,
					labelledBy: 'select a fruit',
					items: FRUITS,
					selectedItemIndex
				}
			} );

			wrapper.find( '#' + LISTBOXID + '-item-' + itemIndex ).trigger( 'mousedown' );

			expect( wrapper.emitted().select[ 0 ][ 0 ] ).toBe( itemIndex, FRUITS[ itemIndex ] );
		} );

	} );

	describe( 'getFormattedItems', () => {

		it( 'if item is array of strings, set items as formatted array of object', () => {

			const selectedItemIndex = 0;
			const fruitItems = [ 'apple', 'banana', 'pear', 'strawberry' ];
			const wrapper = VueTestUtils.mount( SelectMenu, {
				propsData: {
					listboxId: LISTBOXID,
					labelledBy: 'select a fruit',
					items: fruitItems,
					selectedItemIndex
				}
			} );

			expect( wrapper.vm.formattedItems ).toMatchObject( FRUITS.map( function ( item ) {
				return {
					label: item.label.toLowerCase(),
					value: item.value
				};
			} ) );

		} );

		it( 'if item is array of valid objects (label, value), set items as formatted array of object', () => {

			const selectedItemIndex = 0;
			const wrapper = VueTestUtils.mount( SelectMenu, {
				propsData: {
					listboxId: LISTBOXID,
					labelledBy: 'select a fruit',
					items: FRUITS,
					selectedItemIndex
				}
			} );

			expect( wrapper.vm.formattedItems ).toMatchObject( FRUITS );
		} );

		it( 'if item is array of some invalid objects (label, value), set items as formatted array of object', () => {

			const selectedItemIndex = 0;
			const fruitItems = [ {
				label: 'Apple',
				value: 'apple'
			}, {
				label: 'Banana',
				value: 'banana'
			}, {
				label: ''
			}, {
				label: 'Pear',
				value: 'pear'
			}, {
				label: 'Strawberry',
				value: 'strawberry'
			} ];
			const wrapper = VueTestUtils.mount( SelectMenu, {
				propsData: {
					listboxId: LISTBOXID,
					labelledBy: 'select a fruit',
					items: fruitItems,
					selectedItemIndex
				}
			} );

			expect( wrapper.vm.formattedItems ).toMatchObject( [ {
				label: 'Apple',
				value: 'apple'
			}, {
				label: 'Banana',
				value: 'banana'
			},
			false,
			{
				label: 'Pear',
				value: 'pear'
			}, {
				label: 'Strawberry',
				value: 'strawberry'
			}
			] );
		} );

		it( 'if item is an object, set items as formatted array of object', () => {

			const selectedItemIndex = 0;
			const fruitItems = {
				apple: 'Apple',
				banana: 'Banana',
				pear: 'Pear',
				strawberry: 'Strawberry'
			};
			const wrapper = VueTestUtils.mount( SelectMenu, {
				propsData: {
					listboxId: LISTBOXID,
					labelledBy: 'select a fruit',
					items: fruitItems,
					selectedItemIndex
				}
			} );

			expect( wrapper.vm.formattedItems ).toMatchObject( FRUITS );
		} );

		it( 'if item is not passed, , set items as empty array', () => {

			const selectedItemIndex = 0;
			const wrapper = VueTestUtils.mount( SelectMenu, {
				propsData: {
					listboxId: LISTBOXID,
					labelledBy: 'select a fruit',
					selectedItemIndex
				}
			} );

			expect( wrapper.vm.formattedItems ).toMatchObject( [] );
		} );

	} );

} );
