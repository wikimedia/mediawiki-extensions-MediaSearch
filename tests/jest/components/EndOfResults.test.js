const VueTestUtils = require( '@vue/test-utils' ),
	i18n = require( '../plugins/i18n.js' ),
	Component = require( '../../../resources/components/EndOfResults.vue' );

VueTestUtils.config.global.plugins = [ i18n ];

describe( 'EndOfResults', () => {
	const wrapper = VueTestUtils.shallowMount( Component );

	it( 'render the component', () => {
		const element = wrapper.find( '.sdms-end-of-results' );
		expect( element.exists() ).toBe( true );
	} );
	it( 'render mediasearch-end-of-results text', () => {
		const element = wrapper.find( '.sdms-end-of-results p' );
		expect( element.text() ).toBe( 'mediasearch-end-of-results' );
	} );
} );
