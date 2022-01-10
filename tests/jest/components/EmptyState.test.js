const Vuex = require( 'vuex' ),
	VueTestUtils = require( '@vue/test-utils' ),
	when = require( 'jest-when' ).when,
	i18n = require( '../plugins/i18n.js' );

const localVue = VueTestUtils.createLocalVue();
let component = null;
localVue.use( Vuex );
localVue.use( i18n );

const defineComponent = ( totalResult ) => {
	jest.resetModules();
	when( global.mw.config.get )
		.calledWith( 'sdmsTotalSiteImages' )
		.mockReturnValue( totalResult );

	component = require( '../../../resources/components/EmptyState.vue' );
};

describe( 'EmptyState', () => {

	it( 'Does not render the component if sdmsTotalSiteImages is 0', () => {
		defineComponent( 0 );
		const wrapper = VueTestUtils.shallowMount( component );
		const element = wrapper.find( '.sdms-empty-state' );
		expect( element.exists() ).toBe( false );
	} );

	describe( 'when sdmsTotalSiteImages is greater than 0', () => {

		it( 'render the component', () => {
			defineComponent( 1 );
			const wrapper = VueTestUtils.shallowMount( component );
			const element = wrapper.find( '.sdms-empty-state' );
			expect( element.exists() ).toBe( true );
		} );

		it( 'render empty state icon', () => {
			defineComponent( 1 );
			const wrapper = VueTestUtils.shallowMount( component );
			const element = wrapper.find( '.sdms-empty-state__icon' );
			expect( element.exists() ).toBe( true );
		} );

		it( 'render message paragraph', () => {
			defineComponent( 1 );
			const wrapper = VueTestUtils.shallowMount( component );
			const element = wrapper.find( '.sdms-empty-state p' );
			expect( element.exists() ).toBe( true );
		} );
	} );
} );
