const Vue = require( 'vue' );
const VueTestUtils = require( '@vue/test-utils' );
const Select = require( '../../resources/components/base/Select.vue' );

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
			expect( wrapper.text() ).toBe( FRUITS[ index ].label );
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
				expect( wrapper.text() ).toBe( 'Strawberry' );
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
	} );

	test.todo( 'Test behavior with all different possible "item" shapes' );
} );
