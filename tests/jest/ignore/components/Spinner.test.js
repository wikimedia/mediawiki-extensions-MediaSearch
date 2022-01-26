const VueTestUtils = require( '@vue/test-utils' ),
	Component = require( '../../../resources/components/Spinner.vue' );

describe( 'Spinner', () => {
	it( 'render the component', () => {

		const wrapper = VueTestUtils.shallowMount( Component );

		const element = wrapper.find( '.sdms-spinner' );
		expect( element.exists() ).toBe( true );
	} );
} );
