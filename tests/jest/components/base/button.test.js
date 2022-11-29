const VueTestUtils = require( '@vue/test-utils' );
const Vue = require( 'vue' );
const Button = require( '../../../../resources/components/base/Button.vue' );
const Icon = require( '../../../../resources/components/base/Icon.vue' );
const icons = require( '../../../../lib/icons.js' );

// This test is focused on the button component
describe( 'Button Component', () => {

	it( 'renders successfully', () => {

		const wrapper = VueTestUtils.shallowMount( Button, {
			propsData: {
				disabled: false,
				frameless: true,
				invisibleText: false,
				primary: true
			}
		} );

		const element = wrapper.find( '.sd-button' );
		expect( element.exists() ).toBe( true );

	} );

	it( 'click causes a "click" event to be fired', ( done ) => {

		const wrapper = VueTestUtils.shallowMount( Button, {
			propsData: {
				disabled: false,
				frameless: true,
				invisibleText: false,
				primary: true
			}
		} );

		wrapper.find( '.sd-button' ).trigger( 'click' );
		Vue.nextTick().then( () => {
			expect( wrapper.emitted().click ).toHaveLength( 1 );
			done();
		} );

	} );

	it( 'is framed if frameless is passed as false', () => {

		const wrapper = VueTestUtils.shallowMount( Button, {
			propsData: {
				frameless: false
			}
		} );

		expect( wrapper.classes() ).toContain( 'sd-button--framed' );

	} );

	it( 'is disabled if disabled is passed as true', () => {

		const wrapper = VueTestUtils.shallowMount( Button, {
			propsData: {
				disabled: true
			}
		} );

		expect( wrapper.attributes() ).toHaveProperty( 'disabled' );

	} );

	it( 'is progressive if progressive is passed as true', () => {

		const wrapper = VueTestUtils.shallowMount( Button, {
			propsData: {
				progressive: true
			}
		} );

		expect( wrapper.classes() ).toContain( 'sd-button--progressive' );

	} );

	it( 'is destructive if destructive is passed as true', () => {

		const wrapper = VueTestUtils.shallowMount( Button, {
			propsData: {
				destructive: true
			}
		} );

		expect( wrapper.classes() ).toContain( 'sd-button--destructive' );

	} );

	it( 'is primary if primary is passed as true', () => {

		const wrapper = VueTestUtils.shallowMount( Button, {
			propsData: {
				primary: true
			}
		} );

		expect( wrapper.classes() ).toContain( 'sd-button--primary' );
	} );

	it( 'has invisible text if invisibleText is passed as true', () => {

		const wrapper = VueTestUtils.shallowMount( Button, {
			propsData: {
				invisibleText: true
			}
		} );

		expect( wrapper.classes() ).toContain( 'sd-button--invisible-text' );

	} );

	it( 'has icon if icon is passed', () => {

		const wrapper = VueTestUtils.shallowMount( Button, {
			propsData: {
				icon: icons.sdIconAlert
			}
		} );

		expect( wrapper.classes() ).toContain( 'sd-button--icon' );

	} );

	it( 'child icon mounted', () => {

		const wrapper = VueTestUtils.mount( Button, {
			propsData: {
				icon: icons.sdIconAlert
			}
		} );

		expect( wrapper.findComponent( Icon ).exists() ).toBe( true );

	} );
} );
