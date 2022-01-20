const VueTestUtils = require( '@vue/test-utils' ),
	Message = require( '../../../../resources/components/base/Message.vue' ),
	SdIcon = require( '../../../../resources/components/base/Icon.vue' ),
	classOutset = 'sd-message--';

describe( 'Message Component', () => {

	it( 'renders successfully', () => {

		const wrapper = VueTestUtils.shallowMount( Message, {
			propsData: {}
		} );

		const element = wrapper.find( '.sd-message' );

		expect( wrapper.classes() ).toContain( classOutset + 'block' );
		expect( element.exists() ).toBe( true );

	} );

	it( 'renders inline if inline is true', () => {

		const wrapper = VueTestUtils.shallowMount( Message, {
			propsData: {
				inline: true
			}
		} );

		const element = wrapper.find( '.sd-message' );
		expect( element.exists() ).toBe( true );

	} );

	it( 'renders icon successfully', () => {

		const wrapper = VueTestUtils.shallowMount( Message, {
			propsData: {}
		} );

		expect( wrapper.findComponent( SdIcon ).exists() ).toBe( true );

	} );

	describe( 'renders message ', () => {

		it( 'notice, if type is not passed', () => {

			const wrapper = VueTestUtils.shallowMount( Message, {
				propsData: {}
			} );

			expect( wrapper.classes() ).toContain( classOutset + 'notice' );

		} );

		it( 'notice, if type is passed as "notice"', () => {

			const type = 'notice';
			const wrapper = VueTestUtils.shallowMount( Message, {
				propsData: {
					type
				}
			} );

			expect( wrapper.classes() ).toContain( classOutset + type );

		} );

		it( 'warning, if type is passed as "warning"', () => {

			const type = 'warning';
			const wrapper = VueTestUtils.shallowMount( Message, {
				propsData: {
					type
				}
			} );

			expect( wrapper.classes() ).toContain( classOutset + type );

		} );

		it( 'error, if type is passed as "error"', () => {

			const type = 'error';
			const wrapper = VueTestUtils.shallowMount( Message, {
				propsData: {
					type
				}
			} );

			expect( wrapper.classes() ).toContain( classOutset + type );

		} );

		it( 'success, if type is passed as "success"', () => {

			const type = 'success';
			const wrapper = VueTestUtils.shallowMount( Message, {
				propsData: {
					type
				}
			} );

			expect( wrapper.classes() ).toContain( classOutset + type );

		} );

	} );

} );
