const Vue = require( 'vue' );
const VueTestUtils = require( '@vue/test-utils' );
const AutocompleteLookupHandler = require( '../../../resources/mixins/autocompleteLookupHandler.js' );
jest.mock( '../../../resources/getLocationAgnosticMwApi.js' );

describe( 'AutocompleteLookupHandler', () => {
	let mixinsInstance;
	let mockRegexMethod;

	beforeEach( () => {
		mixinsInstance = AutocompleteLookupHandler;
		mockRegexMethod = jest.spyOn( window, 'RegExp' );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'clearLookupResults', () => {

		it( 'lookupResults array is empty', () => {

			const Component = {
				render() {},
				mixins: [ mixinsInstance ]
			};

			const wrapper = VueTestUtils.shallowMount( Component );

			wrapper.setData( {
				lookupResults: [ 'result1', 'result2' ]
			} );

			wrapper.vm.clearLookupResults();

			expect( wrapper.vm.lookupResults ).toStrictEqual( [] );

		} );

	} );

	describe( 'getDebouncedLookupResults', () => {

		beforeEach( () => {
			jest.useFakeTimers();
		} );

		it( 'triggers getLookupResults', () => {

			const input = 'dog';
			const Component = {
				render() {},
				mixins: [ mixinsInstance ]
			};

			const wrapper = VueTestUtils.shallowMount( Component );

			const mockGetLookupResults = jest.fn();
			wrapper.vm.getLookupResults = mockGetLookupResults;

			wrapper.vm.getDebouncedLookupResults( input );

			jest.runTimersToTime( 250 );

			expect( mockGetLookupResults ).toHaveBeenCalled();

		} );

	} );

	describe( 'getLookupResults', () => {

		it( 'with empty input passed clear lookupResults', () => {

			const input = '';
			const Component = {
				render() {},
				mixins: [ mixinsInstance ]
			};

			const wrapper = VueTestUtils.shallowMount( Component );

			wrapper.setData( {
				lookupResults: [ 'result1', 'result2' ]
			} );

			wrapper.vm.getLookupResults( input );

			expect( wrapper.vm.lookupResults ).toStrictEqual( [] );

		} );

		describe( 'with invalid input passed', () => {

			it( 'doLookupRequest not called', () => {

				const input = '[]';
				const Component = {
					render() {},
					mixins: [ mixinsInstance ]
				};

				const wrapper = VueTestUtils.shallowMount( Component );

				const mockDoLookupRequest = jest.fn();
				wrapper.vm.doLookupRequest = mockDoLookupRequest;

				wrapper.vm.getLookupResults( input );

				expect( mockDoLookupRequest ).not.toHaveBeenCalled();

			} );

		} );

		describe( 'with valid input passed', () => {

			it( 'doLookupRequest is called', () => {

				const input = 'dog';

				const Component = {
					render() {},
					mixins: [ mixinsInstance ]
				};

				const wrapper = VueTestUtils.shallowMount( Component );

				const mockDoLockupResolve = jest.fn();
				const mockDoLockupRequest = jest.fn().mockReturnValue( {
					then: mockDoLockupResolve
				} );
				wrapper.vm.doLookupRequest = mockDoLockupRequest;

				wrapper.vm.getLookupResults( input );

				expect( mockDoLockupRequest ).toHaveBeenCalled();
				expect( mockDoLockupResolve ).toHaveBeenCalled();

			} );

			it( 'and no browser support for unicode regex; doLookupRequest is called', () => {

				const input = 'dogs';

				const Component = {
					render() {},
					mixins: [ mixinsInstance ]
				};

				const wrapper = VueTestUtils.shallowMount( Component );

				// Simulate regex error
				mockRegexMethod.mockImplementationOnce( function () {
					throw new Error( '' );
				} );

				const mockDoLockupResolve = jest.fn();
				const mockDoLockupRequest = jest.fn().mockReturnValue( {
					then: mockDoLockupResolve
				} );
				wrapper.vm.doLookupRequest = mockDoLockupRequest;

				wrapper.vm.getLookupResults( input );

				expect( mockDoLockupRequest ).toHaveBeenCalled();
				expect( mockDoLockupResolve ).toHaveBeenCalled();

			} );

			it( 'getFilteredLookupResults passes due to valid result', ( done ) => {

				const input = 'dogs, cat';

				const Component = {
					render() {},
					mixins: [ mixinsInstance ]
				};

				const wrapper = VueTestUtils.shallowMount( Component );

				const mockDoLockupResolve = function ( params ) {
					return params();
				};
				const mockDoLockupRequest = jest.fn().mockReturnValue( {
					then: mockDoLockupResolve
				} );
				wrapper.vm.doLookupRequest = mockDoLockupRequest;

				const mockGetFilteredLookupResults = jest.fn().mockRejectedValue( [] );
				wrapper.vm.getFilteredLookupResults = mockGetFilteredLookupResults;

				wrapper.vm.getLookupResults( input );

				Vue.nextTick().then( () => {
					expect( mockGetFilteredLookupResults ).toHaveBeenCalled();
					done();
				} );

			} );

			it( 'getFilteredLookupResults fails due to invalid result, clear lookupResults', ( done ) => {

				const input = 'dogs, cat';

				const Component = {
					render() {},
					mixins: [ mixinsInstance ]
				};

				const wrapper = VueTestUtils.shallowMount( Component );

				const mockClearLookupResults = jest.fn();
				wrapper.vm.clearLookupResults = mockClearLookupResults;

				const mockDoLockupResolve = function ( params ) {
					return params();
				};

				const mockDoLockupRequest = jest.fn().mockReturnValue( {
					then: mockDoLockupResolve
				} );
				wrapper.vm.doLookupRequest = mockDoLockupRequest;

				const mockGetFilteredLookupResults = jest.fn();
				wrapper.vm.getFilteredLookupResults = mockGetFilteredLookupResults;
				mockGetFilteredLookupResults.mockImplementationOnce( function () {
					throw new Error( '' );
				} );

				wrapper.vm.getLookupResults( input );

				Vue.nextTick().then( () => {
					expect( mockClearLookupResults ).toHaveBeenCalled();
					done();
				} );

			} );

		} );

	} );

	describe( 'doLookupRequest', () => {

		it( 'abort previous lookup promise if new lookup request', () => {

			const input = 'dogs, cat';
			const previousMixinData = mixinsInstance.data();

			// simulate lookupPromises
			const mockAbortResolve = jest.fn();
			mixinsInstance.data = function () {
				previousMixinData.lookupPromises = {
					abort: mockAbortResolve
				};
				return previousMixinData;
			};

			const Component = {
				render() {},
				mixins: [ mixinsInstance ]
			};

			const wrapper = VueTestUtils.shallowMount( Component );

			wrapper.vm.doLookupRequest( input );

			expect( mockAbortResolve ).toHaveBeenCalled();

		} );

		it( 'with multiple input passed as comma seperated string; getLookupRequestForTerm is called', () => {

			const input = 'dogs, cat';

			const Component = {
				render() {},
				mixins: [ mixinsInstance ]
			};

			const wrapper = VueTestUtils.shallowMount( Component );

			const mockGetLookupRequestForTermResolve = function ( paramsFunc ) {
				paramsFunc( {
					search: [ 'dogs', 'cats' ]
				} );
				return {
					promise: jest.fn().mockReturnValue( {
						abort: jest.fn()
					} )
				};
			};

			const mockJqueryApplyResolve = function ( paramsFunc ) {
				paramsFunc( {
					search: [ 'dogs', 'cats' ]
				} );
				return {
					promise: function ( promiseFunc ) {
						return promiseFunc.abort();
					}
				};
			};

			$.when.apply = jest.fn().mockReturnValue( {
				then: mockJqueryApplyResolve
			} );

			const mockGetLookupRequestForTerm = jest.fn().mockReturnValue( {
				then: mockGetLookupRequestForTermResolve
			} );

			wrapper.vm.getLookupRequestForTerm = mockGetLookupRequestForTerm;

			wrapper.vm.doLookupRequest( input );

			expect( mockGetLookupRequestForTerm ).toHaveBeenCalled();
		} );

		it( 'with valid input passed and no browser support for unicode regex; getLookupRequestForTerm is called', () => {

			const input = 'dogs, cat';

			const Component = {
				render() {},
				mixins: [ mixinsInstance ]
			};

			const wrapper = VueTestUtils.shallowMount( Component );

			mockRegexMethod.mockImplementationOnce( function () {
				throw new Error( '' );
			} );

			const mockGetLookupRequestForTermResolve = function ( paramsFunc ) {
				paramsFunc( {
					search: []
				} );
				return {
					promise: jest.fn().mockReturnValue( {
						abort: jest.fn()
					} )
				};
			};

			const mockGetLookupRequestForTerm = jest.fn().mockReturnValue( {
				then: mockGetLookupRequestForTermResolve
			} );
			wrapper.vm.getLookupRequestForTerm = mockGetLookupRequestForTerm;

			wrapper.vm.doLookupRequest( input );

			expect( mockRegexMethod ).toHaveBeenCalled();
			expect( mockGetLookupRequestForTerm ).toHaveBeenCalled();

		} );

	} );

	describe( 'getLookupRequestForTerm', () => {

		it( 'return empty search if lookupDisabled is true', () => {

			const input = 'dogs';

			// simulate lookupPromises
			const previousMixinData = mixinsInstance.data();
			mixinsInstance.data = function () {
				previousMixinData.lookupDisabled = true;
				return previousMixinData;
			};

			const Component = {
				render() {},
				mixins: [ mixinsInstance ]
			};

			const mockJqueryDeferred = jest.fn().mockReturnValue( '' );
			$.Deferred = jest.fn().mockReturnValue( {
				resolve: jest.fn().mockReturnValue( {
					promise: mockJqueryDeferred
				} )
			} );

			const wrapper = VueTestUtils.shallowMount( Component );

			wrapper.vm.getLookupRequestForTerm( input );

			expect( mockJqueryDeferred ).toHaveBeenCalled();

		} );

		it( 'return search results if lookupDisabled is false', () => {

			const input = 'dogs';

			// simulate lookupPromises
			const previousMixinData = mixinsInstance.data();
			mixinsInstance.data = function () {
				previousMixinData.lookupDisabled = false;
				return previousMixinData;
			};

			const Component = {
				render() {},
				mixins: [ mixinsInstance ]
			};

			let mockJqueryDeferred = jest.fn().mockReturnValue( '' );
			$.Deferred = jest.fn().mockReturnValue( {
				resolve: jest.fn().mockReturnValue( {
					promise: mockJqueryDeferred
				} )
			} );

			const wrapper = VueTestUtils.shallowMount( Component );

			wrapper.vm.getLookupRequestForTerm( input );

			expect( mockJqueryDeferred ).not.toHaveBeenCalled();

		} );

	} );

	describe( 'getFilteredLookupResults', () => {

		it( 'return array with length lookupResultsLimit', () => {

			const lookupResults = [ 'dogs', 'old dogs', 'young dogs' ];
			const lookupRegex = /[a-z]/g;
			// simulate lookupPromises
			const previousMixinData = mixinsInstance.data();
			mixinsInstance.data = function () {
				previousMixinData.lookupResultsLimit = 2;
				return previousMixinData;
			};
			const Component = {
				render() {},
				mixins: [ mixinsInstance ]
			};

			const wrapper = VueTestUtils.shallowMount( Component );

			const res = wrapper.vm.getFilteredLookupResults( lookupResults, lookupRegex );

			expect( res.length ).toStrictEqual( previousMixinData.lookupResultsLimit );

		} );

		it( 'returns unique array result', () => {

			const lookupResults = [ 'dogs', 'dark dogs', 'young dogs' ];
			const lookupRegex = /[a-z]/g;
			// simulate lookupPromises
			const previousMixinData = mixinsInstance.data();
			mixinsInstance.data = function () {
				previousMixinData.lookupResultsLimit = 2;
				return previousMixinData;
			};
			const Component = {
				render() {},
				mixins: [ mixinsInstance ]
			};

			const wrapper = VueTestUtils.shallowMount( Component );

			const res = wrapper.vm.getFilteredLookupResults( lookupResults, lookupRegex );

			expect( res[ 0 ] ).toStrictEqual( 'd' );
			expect( res[ 1 ] ).toStrictEqual( 'y' );

		} );

	} );

} );
