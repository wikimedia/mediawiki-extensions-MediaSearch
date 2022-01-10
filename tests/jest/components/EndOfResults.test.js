const VueTestUtils = require( '@vue/test-utils' ),
	i18n = require( '../plugins/i18n.js' ),
	Component = require( '../../../resources/components/EndOfResults.vue' );

const localVue = VueTestUtils.createLocalVue();
localVue.use( i18n );

describe( 'EndOfResults', () => {
	it( 'render the component', () => {
		const wrapper = VueTestUtils.shallowMount( Component, {
			localVue: localVue
		} );

		const element = wrapper.find( '.sdms-end-of-results' );
		expect( element.exists() ).toBe( true );
	} );
	it( 'render mediasearch-end-of-results text', () => {
		const wrapper = VueTestUtils.shallowMount( Component, {
			localVue: localVue
		} );

		const element = wrapper.find( '.sdms-end-of-results p' );
		expect( element.text() ).toBe( 'mediasearch-end-of-results' );
	} );
} );
