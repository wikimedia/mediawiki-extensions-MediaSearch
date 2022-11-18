const { shallowMount } = require( '@vue/test-utils' ),
	Component = require( '../../../resources/components/EndOfResults.vue' );

describe( 'EndOfResults', () => {
	const wrapper = shallowMount( Component );

	it( 'render the component', () => {
		const element = wrapper.find( '.sdms-end-of-results' );
		expect( element.exists() ).toBe( true );
	} );
	it( 'render mediasearch-end-of-results text', () => {
		const element = wrapper.find( '.sdms-end-of-results p' );
		expect( element.text() ).toBe( 'mediasearch-end-of-results' );
	} );
} );
