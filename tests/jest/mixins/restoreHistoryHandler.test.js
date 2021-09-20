const VueTestUtils = require( '@vue/test-utils' );
const RestoreHistoryHandler = require( '../../../resources/mixins/restoreHistoryHandler.js' );
const Performance = require( '../mocks/Performance.js' );
require( '../mocks/EventListener.js' );

describe( 'RestoreHistoryHandler', () => {
	let mixinsInstance;
	beforeEach( () => {
		mixinsInstance = RestoreHistoryHandler;
		mixinsInstance.methods.replaceQueryToHistoryState = jest.fn();
	} );

	afterEach( () => {
		Performance.restorePerformance();
		mixinsInstance.methods.replaceQueryToHistoryState = null;
	} );

	describe( 'on normal navigation', () => {

		it( 'clears stored data on load', () => {

			mixinsInstance.methods.clearStoredPageState = jest.fn();
			const Component = {
				render() {},
				mixins: [ mixinsInstance ]
			};

			Performance.mockPerformanceNavigation();

			VueTestUtils.shallowMount( Component );

			expect( mixinsInstance.methods.clearStoredPageState ).toHaveBeenCalled();
		} );

		it( 'does not restore page state', () => {

			mixinsInstance.methods.clearStoredPageState = jest.fn();
			mixinsInstance.methods.restorePageState = jest.fn();
			Performance.mockPerformanceNavigation();

			const Component = {
				render() {},
				mixins: [ mixinsInstance ]
			};

			VueTestUtils.shallowMount( Component );

			expect( mixinsInstance.methods.restorePageState ).not.toHaveBeenCalled();
		} );
	} );
	describe( 'on back navigation', () => {

		it( 'does not restore data if it does not have stashed data', () => {

			mixinsInstance.methods.clearStoredPageState = jest.fn();
			Performance.mockPerformanceNavigation( 'back_forward' );
			mw.storage.get.mockReturnValueOnce( false );

			const Component = {
				render() {},
				mixins: [ mixinsInstance ]
			};

			VueTestUtils.shallowMount( Component );

			expect( mixinsInstance.methods.restorePageState ).not.toHaveBeenCalled();
		} );

		describe( 'when perf.navigationEntry is supported', () => {

			it( 'restores page state if stored data exists and perf.navigationEntry says that user is back-navigating', () => {

				mixinsInstance.methods.clearStoredPageState = jest.fn();
				mw.storage.get.mockReturnValueOnce( { dummy: 'fake result' } );
				Performance.mockPerformanceNavigation( 'back_forward' );

				const Component = {
					render() {},
					mixins: [ mixinsInstance ]
				};

				VueTestUtils.shallowMount( Component );

				expect( mixinsInstance.methods.restorePageState ).toHaveBeenCalled();
			} );

		} );

		describe( 'when perf.navigationEntry is not supported', () => {
			it( 'restores page state if stored data exists and deprecated performance.navigation.type is 2', () => {

				mixinsInstance.methods.clearStoredPageState = jest.fn();
				mw.storage.get.mockReturnValueOnce( { dummy: 'fake result' } );
				Performance.mockDeprecatedPerformanceNavigation( 2 );

				const Component = {
					render() {},
					mixins: [ mixinsInstance ]
				};

				VueTestUtils.shallowMount( Component );

				expect( mixinsInstance.methods.restorePageState ).toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'on created', () => {

		it( 'add popstate event listener', () => {
			const Component = {
				render() {},
				mixins: [ mixinsInstance ]
			};

			VueTestUtils.shallowMount( Component );

			expect( window.addEventListener ).toHaveBeenCalled();
			expect( window.addEventListener.mock.calls[ 0 ][ 0 ] ).toBe( 'popstate' );
		} );

		it( 'add pagehide event listener', () => {
			const Component = {
				render() {},
				mixins: [ mixinsInstance ]
			};

			VueTestUtils.shallowMount( Component );

			expect( window.addEventListener ).toHaveBeenCalled();
			expect( window.addEventListener.mock.calls[ 1 ][ 0 ] ).toBe( 'pagehide' );
		} );
	} );

	describe( 'onPageHide', () => {

		describe( 'when loading from cache', () => {

			it( 'stored data is cleared', () => {
				mixinsInstance.methods.clearStoredPageState = jest.fn();
				const event = { persisted: true };
				const Component = {
					render() {},
					mixins: [ mixinsInstance ]
				};

				const wrapper = VueTestUtils.shallowMount( Component );

				wrapper.vm.onPageHide( event );

				// the clearStoredPageState is called already on mounted too
				expect( mixinsInstance.methods.clearStoredPageState ).toHaveBeenCalled();
				expect( mixinsInstance.methods.clearStoredPageState ).toHaveBeenCalledTimes( 2 );
			} );
		} );

		describe( 'when not loading from cache', () => {
			it( 'stash page when event is not persisted', () => {
				mixinsInstance.methods.stashPageState = jest.fn();
				const event = { persisted: false };

				const Component = {
					render() {},
					mixins: [ mixinsInstance ]
				};

				const wrapper = VueTestUtils.shallowMount( Component );
				wrapper.vm.onPageHide( event );

				expect( mixinsInstance.methods.stashPageState ).toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'onPopState', () => {

		beforeEach( () => {
			mixinsInstance.methods.stashPageState = jest.fn();
			mixinsInstance.methods.resetResults = jest.fn();
			mixinsInstance.methods.clearLookupResults = jest.fn();
			mixinsInstance.methods.resetFilters = jest.fn();
			mixinsInstance.methods.clearFilterQueryParams = jest.fn();
			mixinsInstance.methods.setSearchTerm = jest.fn();
			mixinsInstance.methods.updateCurrentType = jest.fn();
		} );

		it( 'it does not restore data when state is not passed as argument', () => {
			const event = { state: false };

			const Component = {
				render() {},
				mixins: [ mixinsInstance ]
			};

			const wrapper = VueTestUtils.shallowMount( Component );
			wrapper.vm.onPopState( event );

			expect( mixinsInstance.methods.setSearchTerm ).not.toHaveBeenCalled();
		} );

		it( 'it setSearchTerm using the event search paramether', () => {
			const event = {
				state: {
					search: 'dummy',
					type: 'dummy'
				}
			};

			const Component = {
				render() {},
				mixins: [ mixinsInstance ]
			};

			const wrapper = VueTestUtils.shallowMount( Component );
			wrapper.vm.onPopState( event );

			expect( mixinsInstance.methods.setSearchTerm ).toHaveBeenCalled();
			expect( mixinsInstance.methods.setSearchTerm ).toHaveBeenCalledWith( event.state.search );
		} );

		it( 'it set currentType using the event type paramether', () => {
			const event = {
				state: {
					search: 'dummy',
					type: 'dummy'
				}
			};

			const Component = {
				render() {},
				mixins: [ mixinsInstance ]
			};

			const wrapper = VueTestUtils.shallowMount( Component );
			wrapper.vm.onPopState( event );

			expect( mixinsInstance.methods.updateCurrentType ).toHaveBeenCalled();
			expect( mixinsInstance.methods.updateCurrentType ).toHaveBeenCalledWith( event.state.type );
		} );

		it( 'it clear lookup result if term is empty string', () => {
			const event = {
				state: {
					search: 'dummy',
					type: 'dummy'
				}
			};

			const Component = {
				render() {},
				mixins: [ mixinsInstance ],
				props: {
					currentSearchTerm: ''
				}
			};

			const wrapper = VueTestUtils.shallowMount( Component,
				{
					propsData: {
						currentSearchTerm: ''
					}
				} );
			wrapper.vm.onPopState( event );

			// the currentSearchTerm is set by the setSearchTerm method,
			// but in this case we have to manually set at load to be an empty string
			expect( mixinsInstance.methods.setSearchTerm ).toHaveBeenCalled();

			expect( wrapper.vm.currentSearchTerm ).toBe( '' );
			expect( mixinsInstance.methods.resetResults ).toHaveBeenCalled();
		} );

		it( 'it reset result if term is empty string', () => {
			const event = {
				state: {
					search: 'dummy',
					type: 'dummy'
				}
			};

			const Component = {
				render() {},
				mixins: [ mixinsInstance ],
				props: {
					currentSearchTerm: ''
				}
			};

			const wrapper = VueTestUtils.shallowMount( Component,
				{
					propsData: {
						currentSearchTerm: ''
					}
				} );
			wrapper.vm.onPopState( event );

			// the term is set by the setSearchTerm method,
			// but in this case we have to manually set at load to be an empty string
			expect( mixinsInstance.methods.setSearchTerm ).toHaveBeenCalled();

			expect( wrapper.vm.currentSearchTerm ).toBe( '' );
			expect( mixinsInstance.methods.clearLookupResults ).toHaveBeenCalled();
		} );

		it( 'resetFilters', () => {
			const event = {
				state: {
					search: 'dummy',
					type: 'dummy'
				}
			};

			const Component = {
				render() {},
				mixins: [ mixinsInstance ]
			};

			const wrapper = VueTestUtils.shallowMount( Component );
			wrapper.vm.onPopState( event );

			expect( mixinsInstance.methods.resetFilters ).toHaveBeenCalled();
		} );

		it( 'clearFilterQueryParams', () => {
			const event = {
				state: {
					search: 'dummy',
					type: 'dummy'
				}
			};

			const Component = {
				render() {},
				mixins: [ mixinsInstance ]
			};

			const wrapper = VueTestUtils.shallowMount( Component );
			wrapper.vm.onPopState( event );

			expect( mixinsInstance.methods.clearFilterQueryParams ).toHaveBeenCalled();
		} );
	} );

	describe( 'on beforeDestroy', () => {
		it( 'remove the popstate event listener', () => {
			mixinsInstance.methods.restorePageStateIfNecessary = jest.fn();
			const Component = {
				render() {},
				props: {
					currentType: null,
					term: null
				},
				mixins: [ mixinsInstance ]
			};

			const wrapper = VueTestUtils.shallowMount( Component, {
				propsData: {
					currentType: 'dummy',
					term: 'dummy'
				}
			} );

			wrapper.destroy();

			expect( window.removeEventListener ).toHaveBeenCalled();
			expect( window.removeEventListener ).toHaveBeenCalledTimes( 1 );

		} );
	} );

	describe( 'on mounted', () => {
		it( 'triggers replaceQueryToHistoryState', () => {
			const Component = {
				render() {},
				mixins: [ mixinsInstance ]
			};

			VueTestUtils.shallowMount( Component );

			expect( mixinsInstance.methods.replaceQueryToHistoryState ).toHaveBeenCalled();

		} );
	} );
} );
