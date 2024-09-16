const VueTestUtils = require( '@vue/test-utils' );
const Vue = require( 'vue' );
const ImageComponent = require( '../../../../resources/components/base/Image.vue' );
require( '../../mocks/IntersectionObserver.js' );

// Sample test image props
const samplePropsData = {
	source:
    'https://upload.wikimedia.org/wikipedia/commons/3/32/Tired_20-year-old_cat.jpg',
	alt: 'Tired 20-year-old cat'
};

describe( 'Image Component', () => {

	jest.useFakeTimers();

	it( 'Renders successfully', () => {
		const wrapper = VueTestUtils.shallowMount( ImageComponent, {
			propsData: samplePropsData
		} );

		const element = wrapper.find( '.sd-image' );
		expect( element.exists() ).toBe( true );

	} );

	it( 'width and height style match props', () => {

		const propsData = {
			source: samplePropsData.source,
			alt: samplePropsData.alt,
			originalWidth: 200,
			originalHeight: 200
		};
		const wrapper = VueTestUtils.shallowMount( ImageComponent, {
			propsData
		} );

		expect( wrapper.attributes().style ).toContain(
			propsData.originalWidth.toString()
		);

		expect( wrapper.attributes().style ).toContain(
			propsData.originalHeight.toString()
		);

	} );

	it( 'source is set when observerIntersecting is true', () => {
		const wrapper = VueTestUtils.shallowMount( ImageComponent, {
			propsData: samplePropsData
		} );

		wrapper.vm.observerIntersecting = true;

		Vue.nextTick().then( () => {

			jest.advanceTimersByTime( 300 );

			expect( wrapper.attributes().src ).toBe( samplePropsData.source );

		} );

	} );

} );
