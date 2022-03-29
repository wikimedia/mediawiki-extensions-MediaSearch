const Vue = require( 'vue' );
const VueTestUtils = require( '@vue/test-utils' );
const Checkbox = require( '../../../../resources/components/base/Checkbox.vue' );
jest.mock( '../../../../resources/components/base/mixins/binaryInput.js' );

describe( 'Checkbox Component', () => {

	it( 'Renders successfully', () => {
		const wrapper = VueTestUtils.shallowMount( Checkbox, {
			propsData: {
				disabled: false,
				value: true
			}
		} );

		const element = wrapper.find( '.sd-checkbox' );
		expect( element.exists() ).toBe( true );
	} );

	it( 'is disabled if disabled is passed as true', () => {
		const wrapper = VueTestUtils.shallowMount( Checkbox, {
			propsData: {
				disabled: true,
				value: true
			}
		} );

		const element = wrapper.find( '.sd-checkbox__input' );
		expect( element.attributes().disabled ).toBe( 'disabled' );
	} );

	it( 'check if element is checked if value is passed as true', ( done ) => {
		const wrapper = VueTestUtils.mount( Checkbox, {
			propsData: {
				value: true
			}
		} );

		const input = wrapper.find( '.sd-checkbox__input' );

		Vue.nextTick().then( () => {
			expect( input.element.checked ).toBe( true );
			done();
		} );
	} );

	it( 'element is unchecked if value is passed as false', ( done ) => {
		const wrapper = VueTestUtils.mount( Checkbox, {
			propsData: {
				value: false
			}
		} );

		const input = wrapper.find( '.sd-checkbox__input' );

		Vue.nextTick().then( () => {
			expect( input.element.checked ).toBe( false );
			done();
		} );
	} );

	it( 'element gets unchecked if value is passed as true and label is clicked', ( done ) => {
		const wrapper = VueTestUtils.mount( Checkbox, {
			propsData: {
				value: true
			}
		} );

		const input = wrapper.find( '.sd-checkbox__input' );

		wrapper.trigger( 'click' );

		Vue.nextTick().then( () => {
			expect( input.element.checked ).toBe( false );
			done();
		} );
	} );

} );
