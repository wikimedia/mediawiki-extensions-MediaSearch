/* eslint-disable compat/compat */
const VueTestUtils = require( '@vue/test-utils' );
const Vue = require( 'vue' );
const Observer = require( '../../../resources/components/base/mixins/observer.js' );
const IntersectionObserverSpies = require( '../mocks/IntersectionObserver.js' );

describe( 'Observer', () => {
	let observerInstance;
	beforeEach( () => {
		observerInstance = Observer;
	} );

	describe( 'when initialized', () => {

		it( 'calls the IntersectionObserver API', () => {
			const Component = {
				render() {},
				mixins: [ observerInstance ]
			};

			observerInstance.methods.defineObserverElement = jest.fn().mockReturnValue( true );

			VueTestUtils.shallowMount( Component );

			expect( window.IntersectionObserver ).toHaveBeenCalled();
		} );

		it( 'define the observerElement', ( done ) => {
			const Component = {
				render() {},
				mixins: [ observerInstance ]
			};

			observerInstance.methods.defineObserverElement = jest.fn().mockReturnValue( true );

			VueTestUtils.shallowMount( Component );

			Vue.nextTick().then( () => {
				expect( observerInstance.methods.defineObserverElement ).toHaveBeenCalled();
				done();
			} );
		} );

		it( 'triggers the observation with the defined element', ( done ) => {
			const Component = {
				render() {},
				mixins: [ observerInstance ]
			};
			const mockSelector = 'mock-element-selector';

			observerInstance.methods.defineObserverElement = jest.fn().mockReturnValue( mockSelector );

			VueTestUtils.shallowMount( Component );

			Vue.nextTick().then( () => {
				expect( IntersectionObserverSpies.observe ).toHaveBeenCalled();
				expect( IntersectionObserverSpies.observe ).toHaveBeenCalledWith( mockSelector );
				done();
			} );
		} );

		it( 'trigger the observer.disconnect method when destroyed', ( done ) => {
			const Component = {
				render() {},
				mixins: [ observerInstance ]
			};
			const mockSelector = 'mock-element-selector';

			observerInstance.methods.disconnectObserver = jest.fn();
			observerInstance.methods.defineObserverElement = jest.fn().mockReturnValue( mockSelector );

			const wrapper = VueTestUtils.shallowMount( Component );

			Vue.nextTick().then( () => {
				wrapper.unmount();

				expect( observerInstance.methods.disconnectObserver ).toHaveBeenCalled();
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

		it( 'set the observerIntersecting data to "false" when value isIntersecting is falsy', () => {
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

		it( 'set the observerIntersecting data to "true" when value isIntersecting is truthy', () => {
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
