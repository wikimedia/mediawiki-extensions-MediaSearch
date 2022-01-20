const VueTestUtils = require( '@vue/test-utils' ),
	Radio = require( '../../../../resources/components/base/Radio.vue' );
jest.mock( '../../../../resources/components/base/mixins/binaryInput.js' );

describe( 'Radio Component', () => {

	it( 'Renders successfully', () => {
		const wrapper = VueTestUtils.shallowMount( Radio, {
			propsData: {
				name: 'demo'
			}
		} );

		const element = wrapper.find( '.sd-radio' );
		expect( element.exists() ).toBe( true );
	} );

	it( 'renders the name property', () => {
		const wrapper = VueTestUtils.shallowMount( Radio, {
			propsData: {
				disabled: true,
				name: 'demo'
			}
		} );

		const element = wrapper.find( '.sd-radio__input' );
		expect( element.attributes().name ).toBe( 'demo' );
	} );

	it( 'is disabled if disabled is passed as true', () => {
		const wrapper = VueTestUtils.shallowMount( Radio, {
			propsData: {
				disabled: true,
				name: 'demo'
			}
		} );

		const element = wrapper.find( '.sd-radio__input' );
		expect( element.attributes().disabled ).toBe( 'disabled' );
	} );

	it( 'keydown causes a "click" event to be called', () => {
		const wrapper = VueTestUtils.shallowMount( Radio, {
			propsData: {
				value: true
			}
		} );

		const mockRegexMethod = jest.spyOn( wrapper.vm.$refs.label, 'click' );

		const element = wrapper.find( '.sd-radio' );

		element.trigger( 'keydown.enter' );

		expect( mockRegexMethod ).toHaveBeenCalled();

	} );

} );
