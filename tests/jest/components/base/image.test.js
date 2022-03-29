const VueTestUtils = require( '@vue/test-utils' );
const Vue = require( 'vue' );
const Image = require( '../../../../resources/components/base/Image.vue' );
const Observer = require( '../../../../resources/components/base/mixins/observer.js' );
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
		const wrapper = VueTestUtils.shallowMount( Image, {
			propsData: samplePropsData
		} );

		const element = wrapper.find( '.sd-image' );
		expect( element.exists() ).toBe( true );

	} );

	it( 'width and height style match props', () => {

		const propsData = { source: samplePropsData.source, alt: samplePropsData.alt, originalWidth: 200, originalHeight: 200 };
		const wrapper = VueTestUtils.shallowMount( Image, {
			propsData
		} );

		expect( wrapper.attributes().style ).toContain(
			propsData.originalWidth.toString()
		);

		expect( wrapper.attributes().style ).toContain(
			propsData.originalHeight.toString()
		);

	} );

	it( 'source is set immediately if observer is not supported', () => {
		const wrapper = VueTestUtils.shallowMount( Image, {
			propsData: samplePropsData
		} );

		expect( wrapper.attributes().src ).toBe( samplePropsData.source );

	} );

	it( 'source is not set if observer is supported', ( done ) => {

		let observerInstance = Observer;

		observerInstance.methods.supportsObserverCheck = jest.fn().mockReturnValue( true );
		observerInstance.methods.defineObserverElement = jest.fn().mockReturnValue( 'mock-element-selector' );

		const wrapper = VueTestUtils.mount( Image, {
			propsData: samplePropsData,
			mixins: [ observerInstance ]
		} );

		Vue.nextTick().then( () => {

			expect( wrapper.vm.observerSupported ).toBe( true );
			expect( wrapper.attributes().src ).toBeUndefined();

			done();

		} );

	} );

	it( 'source is set when observerIntersecting is true', () => {
		const wrapper = VueTestUtils.shallowMount( Image, {
			propsData: samplePropsData
		} );

		wrapper.vm.observerIntersecting = true;

		Vue.nextTick().then( () => {

			jest.runTimersToTime( 300 );

			expect( wrapper.attributes().src ).toBe( samplePropsData.source );

		} );

	} );

} );
