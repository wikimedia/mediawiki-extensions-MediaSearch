const initialState = require( './fixtures/initialVuexState.js' ),
	namespaceGroups = require( './fixtures/namespaceGroups.js' ),
	mockImageSearchApiResponse = require( './fixtures/mockImageSearchApiResponse.json' ),
	thumbRenderMap = [ 320, 640, 800, 1024, 1280, 1920 ],
	when = require( 'jest-when' ).when;
require( './mocks/history.js' );

let context;
let actions;

beforeEach( () => {
	jest.resetModules();
	actions = require( '../../resources/store/actions.js' );

	// Fake Vuex context object
	// (see: https://vuex.vuejs.org/api/#actions)
	context = {
		state: JSON.parse( JSON.stringify( initialState ) ),
		getters: jest.fn(),
		commit: jest.fn(),
		dispatch: jest.fn()
	};

	// Search term & type
	context.getters.currentSearchTerm = 'cat';
	context.getters.currentType = 'image';

	// eslint-disable-next-line no-underscore-dangle
	actions._vm = {
		$log: jest.fn()
	};

	// this is required to make sure that the getters and setters
	// are available within the "this"
	actions.getters = context.getters;
	actions.state = context.state;
	actions.commit = context.commit;
} );

afterEach( () => {
	jest.useRealTimers();
	context = null;
	actions = null;
} );

// this tests are focused at the internal search function
describe( 'search', () => {

	beforeEach( () => {
		// Mocks for mw.config values
		when( global.mw.config.get ).calledWith( 'wgUserLanguage' ).mockReturnValue( 'en' );
		when( global.mw.config.get ).calledWith( 'sdmsNamespaceGroups' ).mockReturnValue( namespaceGroups );
		when( global.mw.config.get ).calledWith( 'sdmsThumbRenderMap' ).mockReturnValue( thumbRenderMap );
		when( global.mw.config.get ).calledWith( 'sdmsExternalSearchUri' ).mockReturnValue( false );

		// Fake an API response
		global.mw.Api.prototype.get.mockReturnValue(
			$.Deferred().resolve( mockImageSearchApiResponse ).promise()
		);

	} );

	describe( 'performNewSearch', () => {
		it( 'is a function', () => {
			expect( actions.performNewSearch ).toBeInstanceOf( Function );
		} );

		it( 'makes an API request with the correct params for "image" type searches', () => {
			actions.performNewSearch( context );
			expect( global.mw.Api.prototype.get ).toHaveBeenCalledWith(
				expect.objectContaining( {
					action: 'query',
					format: 'json',
					generator: 'search',
					gsrsearch: `filetype:bitmap|drawing ${context.getters.currentSearchTerm}`,
					gsrnamespace: 6,
					gsrlimit: 40,
					gsroffset: 0,
					gsrinfo: 'totalhits|suggestion',
					gsrprop: 'size|wordcount|timestamp|snippet',
					prop: 'info|imageinfo|entityterms',
					inprop: 'url',
					iiprop: 'url|size|mime',
					iiurlheight: 180,
					wbetterms: 'label'
				} )
			);
		} );

		it( 'makes an API request with the correct params for "page" type searches', () => {
			let allNamespaces = Object.keys( namespaceGroups.all ).join( '|' );
			context.getters.currentType = 'page';
			actions.performNewSearch( context );
			expect( global.mw.Api.prototype.get ).toHaveBeenCalledWith(
				expect.objectContaining( {
					action: 'query',
					format: 'json',
					generator: 'search',
					gsrsearch: `${context.getters.currentSearchTerm}`,
					gsrnamespace: allNamespaces,
					gsrlimit: 40,
					gsroffset: 0,
					gsrinfo: 'totalhits|suggestion',
					gsrprop: 'size|wordcount|timestamp|snippet',
					prop: 'info|categoryinfo'
				} )
			);
		} );

		it( 'makes an API request with the correct params for "other" type searches', () => {
			context.getters.currentType = 'other';
			actions.performNewSearch( context );
			expect( global.mw.Api.prototype.get ).toHaveBeenCalledWith(
				expect.objectContaining( {
					action: 'query',
					format: 'json',
					generator: 'search',
					gsrsearch: `filetype:multimedia|office|archive|3d ${context.getters.currentSearchTerm}`,
					gsrnamespace: 6,
					gsrlimit: 40,
					gsroffset: 0,
					gsrinfo: 'totalhits|suggestion',
					gsrprop: 'size|wordcount|timestamp|snippet',
					prop: 'info|imageinfo|entityterms',
					inprop: 'url',
					iiprop: 'url|size|mime',
					iiurlheight: undefined,
					iiurlwidth: 320,
					wbetterms: 'label'
				} )
			);
		} );

		it( 'makes an API request with the correct params for "video" type searches', () => {
			context.getters.currentType = 'video';
			actions.performNewSearch( context );
			expect( global.mw.Api.prototype.get ).toHaveBeenCalledWith(
				expect.objectContaining( {
					action: 'query',
					format: 'json',
					generator: 'search',
					gsrsearch: `filetype:video ${context.getters.currentSearchTerm}`,
					gsrnamespace: 6,
					gsrlimit: 40,
					gsroffset: 0,
					gsrinfo: 'totalhits|suggestion',
					gsrprop: 'size|wordcount|timestamp|snippet',
					prop: 'info|imageinfo|entityterms',
					inprop: 'url',
					iiprop: 'url|size|mime',
					iiurlheight: undefined,
					iiurlwidth: 200,
					wbetterms: 'label'
				} )
			);
		} );

		it( 'makes an API request with the correct gsrsearch param for "image" type searches when filterValues is undefined', () => {
			context.state.filterValues[ context.getters.currentType ] = undefined;

			actions.performNewSearch( context );
			expect( global.mw.Api.prototype.get ).toHaveBeenCalledWith(
				expect.objectContaining( {
					gsrsearch: `filetype:bitmap|drawing ${context.getters.currentSearchTerm}`
				} )
			);
		} );

		it( 'sets the pending state to true when dispatched', () => {
			actions.performNewSearch( context );
			expect( context.commit ).toHaveBeenCalledWith( 'setPending', {
				pending: true,
				type: context.getters.currentType
			} );
		} );

		it( 'resets the error state to false when dispatched', () => {
			actions.performNewSearch( context );
			expect( context.commit ).toHaveBeenCalledWith( 'setHasError', false );
		} );

		it( 'sets the pending state to false when the request is complete', ( done ) => {
			actions.performNewSearch( context ).then( () => {
				expect( context.commit ).toHaveBeenCalledWith( 'setPending', {
					pending: true,
					type: context.getters.currentType
				} );
				done();
			} ).catch( ( error ) => done( error ) );
		} );

		it( 'commits an "addResult" mutation for every result returned from the API', done => {
			actions.performNewSearch( context ).then( () => {
				let addResultCalls = context.commit.mock.calls.filter( call => call[ 0 ] === 'addResult' );
				expect(
					addResultCalls.length
				).toEqual(
					Object.keys( mockImageSearchApiResponse.query.pages ).length
				);
				done();
			} );
		} );

		it( 'Handles errors successfully', done => {
			const deferred = $.Deferred(),
				promise = deferred.promise(),
				pendingRequestType = 'video';

			// we need to set a different type than the current one in pending state
			context.state.pending[ pendingRequestType ] = true;
			global.mw.Api.prototype.get.mockReturnValue( promise );
			actions.performNewSearch( context );

			promise.then( () => {
				// We only care about errors here, so do nothing
			} ).catch( () => {
				expect( context.commit ).toHaveBeenCalledWith( 'setHasError', true );
			} ).always( () => {
				expect( context.commit ).toHaveBeenCalledWith( 'setPending', {
					type: pendingRequestType,
					pending: false
				} );
				done();
			} );

			// This is our "trigger" so that our code above executes
			deferred.reject( {} );
		} );

		it( 'will log a search_new action', done => {

			/* eslint-disable no-underscore-dangle */
			actions.performNewSearch( context ).then( () => {
				expect( actions._vm.$log ).toHaveBeenCalled();
				expect( actions._vm.$log ).toBeCalledWith( expect.any( Object ) );
				expect( actions._vm.$log.mock.calls[ 0 ][ 0 ].action ).toBeTruthy();
				expect( actions._vm.$log.mock.calls[ 0 ][ 0 ].action ).toBe( 'search_new' );
				done();
			} );
			/* eslint-enable no-underscore-dangle */
		} );
	} );

	describe( 'searchMore', () => {
		describe( 'will not run', () => {
			it( 'if checkForMore for current mediaType is false', () => {
				context.getters.currentType = 'image';
				context.getters.allResultsEmpty = false;
				context.getters.checkForMore = {
					image: false
				};
				actions.searchMore( context );
				expect( global.mw.Api.prototype.get ).not.toHaveBeenCalled();
			} );
			it( 'if autoloadCounter for current mediaType is 0', () => {
				context.getters.currentType = 'image';
				context.getters.allResultsEmpty = false;
				context.getters.checkForMore = {
					image: true
				};
				context.state.autoloadCounter = {
					image: 0
				};
				actions.searchMore( context );
				expect( global.mw.Api.prototype.get ).not.toHaveBeenCalled();
			} );
			it( 'if search state is error', () => {
				context.getters.currentType = 'image';
				context.getters.allResultsEmpty = false;
				context.getters.checkForMore = {
					image: true
				};
				context.state.autoloadCounter = {
					image: 1
				};
				context.state.hasError = true;
				actions.searchMore( context );
				expect( global.mw.Api.prototype.get ).not.toHaveBeenCalled();
			} );
		} );
		it( 'will run a search if state is not pending', () => {
			context.getters.currentType = 'image';
			context.getters.allResultsEmpty = false;
			context.getters.checkForMore = {
				image: true
			};
			context.state.autoloadCounter = {
				image: 1
			};

			actions.searchMore( context );

			expect( global.mw.Api.prototype.get ).toHaveBeenCalled();
		} );

		it( 'will log a search_load_more action', done => {
			expect.hasAssertions();
			context.getters.currentType = 'image';
			context.getters.allResultsEmpty = false;
			context.getters.checkForMore = {
				image: true
			};
			context.state.autoloadCounter = {
				image: 1
			};

			/* eslint-disable no-underscore-dangle */
			actions.searchMore( context ).then( () => {
				expect( actions._vm.$log ).toHaveBeenCalled();
				expect( actions._vm.$log ).toBeCalledWith( expect.any( Object ) );
				expect( actions._vm.$log.mock.calls[ 0 ][ 0 ].action ).toBeTruthy();
				expect( actions._vm.$log.mock.calls[ 0 ][ 0 ].action ).toBe( 'search_load_more' );
				done();
			} );
			/* eslint-enable no-underscore-dangle */
		} );

		it( 'will decreate autocounter', done => {
			expect.hasAssertions();
			context.getters.currentType = 'image';
			context.getters.allResultsEmpty = false;
			context.getters.checkForMore = {
				image: true
			};
			context.state.autoloadCounter = {
				image: 1
			};

			actions.searchMore( context ).then( () => {
				expect( context.commit ).toHaveBeenCalled();
				expect( context.commit ).toHaveBeenCalledWith( 'decreaseAutoloadCounterForMediaType', context.getters.currentType );
				done();
			} );
		} );
		describe( 'when resetCounter is set to true', () => {
			it( 'will reset the auto counter', () => {
				context.getters.currentType = 'image';
				context.getters.allResultsEmpty = false;
				context.getters.checkForMore = {
					image: true
				};
				context.state.autoloadCounter = {
					image: 1
				};

				actions.searchMore( context, true );

				expect( context.commit ).toHaveBeenCalled();
				expect( context.commit ).toHaveBeenCalledWith( 'resetAutoLoadForMediaType', context.getters.currentType );
			} );
			it( 'will not decrease autocounter, if resetCounter argument is true', done => {
				context.getters.currentType = 'image';
				context.getters.allResultsEmpty = false;
				context.getters.checkForMore = {
					image: true
				};
				context.state.autoloadCounter = {
					image: 1
				};

				actions.searchMore( context, true ).then( () => {
					const decreaseAutoloadCounterForMediaTypeCalls = context.commit.mock.calls.filter( call => call[ 0 ] === 'decreaseAutoloadCounterForMediaType' );
					expect( decreaseAutoloadCounterForMediaTypeCalls.length ).toBe( 0 );
					done();
				} );
			} );
		} );
	} );
} );

describe( 'clear', () => {

	it( 'commits all the expected mutations when called', () => {
		actions.clear( context );
		expect( context.commit ).toHaveBeenCalledWith( 'clearTerm' );
		expect( context.commit ).toHaveBeenCalledWith( 'resetFilters' );
		expect( context.commit ).toHaveBeenCalledWith( 'resetResults' );
		expect( context.commit ).toHaveBeenCalledWith( 'clearDidYouMean' );
	} );
} );

describe( 'ready', () => {

	it( 'commits the setInitialized mutation when called', () => {
		actions.ready( context );
		expect( context.commit ).toHaveBeenCalledWith( 'setInitialized' );
	} );
} );

describe( 'pushQueryToHistoryState', () => {

	it( 'calls history push state', () => {
		actions.pushQueryToHistoryState( context );
		expect( window.history.pushState ).toHaveBeenCalled();
	} );

	it( 'it passes the state.urQuery params', () => {
		context.state.uriQuery = {
			dummy: 'test'
		};

		actions.pushQueryToHistoryState( context );
		expect( window.history.pushState.mock.calls[ 0 ][ 0 ] ).toMatchObject( context.state.uriQuery );
	} );
} );

describe( 'replaceQueryToHistoryState', () => {

	it( 'calls history push state', () => {
		actions.replaceQueryToHistoryState( context );
		expect( window.history.replaceState ).toHaveBeenCalled();
	} );

	it( 'it passes the state.urQuery params', () => {
		context.state.uriQuery = {
			dummy: 'test'
		};

		actions.replaceQueryToHistoryState( context );
		expect( window.history.replaceState.mock.calls[ 0 ][ 0 ] ).toMatchObject( context.state.uriQuery );
	} );
} );

describe( 'updateCurrentType', () => {

	beforeEach( () => {
		context.getters.currentType = 'dummy';
	} );

	it( 'remove existing filters', () => {
		actions.updateCurrentType( context );
		expect( context.commit ).toHaveBeenCalled();
		expect( context.commit.mock.calls[ 0 ][ 0 ] ).toBe( 'clearFilterQueryParams' );
	} );

	it( 'set current type', () => {
		const newType = 'test';
		actions.updateCurrentType( context, newType );
		expect( context.commit ).toHaveBeenCalled();
		expect( context.commit.mock.calls[ 1 ][ 0 ] ).toBe( 'setCurrentType' );
		expect( context.commit.mock.calls[ 1 ][ 1 ] ).toBe( newType );
	} );

	it( 'updates filter query params with current type', () => {
		context.state.filterValues = {
			test: {
				dummyFilter: true
			}
		};
		actions.updateCurrentType( context, 'test' );
		expect( context.commit ).toHaveBeenCalled();
		expect( context.commit.mock.calls[ 2 ][ 0 ] ).toBe( 'updateFilterQueryParams' );
		expect( context.commit.mock.calls[ 2 ][ 1 ] ).toBe( context.state.filterValues.test );
	} );

	it( 'does not trigger anything if type has not changed', () => {
		context.getters.currentType = 'dummy';
		actions.updateCurrentType( context, 'dummy' );
		expect( context.commit ).not.toHaveBeenCalled();
	} );
} );

describe( 'clearQueryParams', () => {

	it( 'triggers clearTerm mutation', () => {
		actions.clearQueryParams( context );
		expect( context.commit ).toHaveBeenCalled();
		expect( context.commit.mock.calls[ 0 ][ 0 ] ).toBe( 'clearTerm' );
	} );

	it( 'triggers clearFilterQueryParams mutation', () => {
		actions.clearQueryParams( context );
		expect( context.commit ).toHaveBeenCalled();
		expect( context.commit.mock.calls[ 1 ][ 0 ] ).toBe( 'clearFilterQueryParams' );
	} );

	it( 'triggers pushQueryToHistoryState action', () => {
		actions.clearQueryParams( context );
		expect( context.dispatch ).toHaveBeenCalled();
		expect( context.dispatch ).toHaveBeenCalledWith( 'pushQueryToHistoryState' );
	} );
} );
