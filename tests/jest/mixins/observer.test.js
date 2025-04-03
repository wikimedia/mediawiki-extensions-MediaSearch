/* eslint-disable compat/compat */
const VueTestUtils = require( '@vue/test-utils' );
const Vue = require( 'vue' );
const Observer = require( '../../../resources/components/base/mixins/observer.js' );
const IntersectionObserverSpies = require( '../mocks/IntersectionObserver.js' );

describe( 'Observer', () => {
	let observerInstance, defineObserverDefaultSpy;
	beforeEach( () => {
		observerInstance = Observer;
		defineObserverDefaultSpy = jest.spyOn( observerInstance.methods, 'defineObserverElement' ).mockReturnValue( true );
	} );
	afterEach( () => {
		defineObserverDefaultSpy.mockRestore();
	} );

	describe( 'when initialized', () => {

		it( 'calls the IntersectionObserver API', () => {
			const Component = {
				render() {},
				mixins: [ observerInstance ]
			};

			VueTestUtils.shallowMount( Component );

			expect( window.IntersectionObserver ).toHaveBeenCalled();
		} );

		it( 'defines the observerElement', ( done ) => {
			const Component = {
				render() {},
				mixins: [ observerInstance ]
			};

			VueTestUtils.shallowMount( Component );

			Vue.nextTick().then( () => {
				expect( defineObserverDefaultSpy ).toHaveBeenCalled();
				done();
			} );
		} );

		it( 'triggers the observation with the defined element', ( done ) => {
			const Component = {
				render() {},
				mixins: [ observerInstance ]
			};
			const mockSelector = 'mock-element-selector';

			const defineObserverSpy = jest.spyOn( observerInstance.methods, 'defineObserverElement' ).mockReturnValue( mockSelector );

			VueTestUtils.shallowMount( Component );

			Vue.nextTick().then( () => {
				expect( IntersectionObserverSpies.observe ).toHaveBeenCalled();
				expect( IntersectionObserverSpies.observe ).toHaveBeenCalledWith( mockSelector );
				defineObserverSpy.mockRestore();
				done();
			} );
		} );

		it( 'triggers the observer.disconnect method when destroyed', ( done ) => {
			const Component = {
				render() {},
				mixins: [ observerInstance ]
			};
			const disconnectSpy = jest.spyOn( observerInstance.methods, 'disconnectObserver' );

			const wrapper = VueTestUtils.shallowMount( Component );

			Vue.nextTick().then( () => {
				wrapper.unmount();

				expect( disconnectSpy ).toHaveBeenCalled();
				disconnectSpy.mockRestore();
				done();
			} );
		} );
	} );

	describe( 'when intersectionCallback is triggered', () => {
		it( 'triggers a change event', () => {
			const Component = {
				render() {},
				mixins: [ observerInstance ]
			};
			const mockCallbackArgument = [
				{ isIntersecting: false }
			];

			const wrapper = VueTestUtils.shallowMount( Component );
			wrapper.vm.intersectionCallback( mockCallbackArgument );

			expect( wrapper.emitted().change ).toBeTruthy();
		} );

		it( 'triggers an "hide" event, when method called with a falsy isIntersecting', () => {
			const Component = {
				render() {},
				mixins: [ observerInstance ]
			};
			const mockCallbackArgument = [
				{ isIntersecting: false }
			];

			const wrapper = VueTestUtils.shallowMount( Component );
			wrapper.vm.intersectionCallback( mockCallbackArgument );

			expect( wrapper.emitted().hide ).toBeTruthy();
		} );

		it( 'sets the observerIntersecting data to "false" when value isIntersecting is falsy', () => {
			const Component = {
				render() {},
				mixins: [ observerInstance ]
			};
			const mockCallbackArgument = [
				{ isIntersecting: false }
			];

			const wrapper = VueTestUtils.shallowMount( Component );
			wrapper.vm.intersectionCallback( mockCallbackArgument );

			expect( wrapper.vm.observerIntersecting ).toBeFalsy();
		} );

		it( 'triggers an "intersect" event, when method called with isIntersecting', () => {
			const Component = {
				render() {},
				mixins: [ observerInstance ]
			};
			const mockCallbackArgument = [
				{ isIntersecting: true }
			];

			const wrapper = VueTestUtils.shallowMount( Component );
			wrapper.vm.intersectionCallback( mockCallbackArgument );

			expect( wrapper.emitted().intersect ).toBeTruthy();
		} );

		it( 'sets the observerIntersecting data to "true" when value isIntersecting is truthy', () => {
			const Component = {
				render() {},
				mixins: [ observerInstance ]
			};
			const mockCallbackArgument = [
				{ isIntersecting: true }
			];

			const wrapper = VueTestUtils.shallowMount( Component );
			wrapper.vm.intersectionCallback( mockCallbackArgument );

			expect( wrapper.vm.observerIntersecting ).toBeTruthy();
		} );
	} );
} );
