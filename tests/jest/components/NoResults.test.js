const VueTestUtils = require( '@vue/test-utils' ),
	i18n = require( '../plugins/i18n.js' ),
	Component = require( '../../../resources/components/NoResults.vue' );

VueTestUtils.config.global.plugins = [ i18n ];

describe( 'NoResults', () => {
	const wrapper = VueTestUtils.shallowMount( Component );

	it( 'render the component', () => {
		const element = wrapper.find( '.sdms-no-results' );
		expect( element.exists() ).toBe( true );
	} );
	it( 'render the no result icon', () => {
		const element = wrapper.find( '.sdms-no-results__icon' );
		expect( element.exists() ).toBe( true );
	} );
	it( 'render mediasearch-no-results text', () => {
		const element = wrapper.find( '.sdms-no-results p' );
		expect( element.text() ).toContain( 'mediasearch-no-results' );
	} );
	it( 'render mediasearch-no-results-tips text', () => {
		const element = wrapper.find( '.sdms-no-results__tips' );
		expect( element.text() ).toContain( 'mediasearch-no-results-tips' );
	} );
} );
