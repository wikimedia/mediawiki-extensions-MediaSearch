const initialState = require( '../fixtures/initialVuexState.js' ),
	namespaceGroups = require( '../fixtures/namespaceGroups.js' ),
	mockImageSearchApiResponse = require( '../fixtures/mockImageSearchApiResponse.json' ),
	mockEmptyImageSearchApiWithSuggestionResponse = require( '../fixtures/mockEmptyImageSearchApiWithSuggestion.json' ),
	mockEmptyImageSearchApiWithWarningsResponse = require( '../fixtures/mockEmptyImageSearchApiWithWarnings.json' ),
	mockImageDetailsApiResponse = require( '../fixtures/mockImageDetailsApiResponse.json' ),
	thumbRenderMap = [ 320, 640, 800, 1024, 1280, 1920 ],
	when = require( 'jest-when' ).when;

require( '../mocks/history.js' );

let context;
let actions;

beforeEach( () => {
	jest.resetModules();
	actions = require( '../../../resources/store/actions.js' );

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
describe( 'performNewSearch', () => {

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

	it( 'is a function', () => {
		expect( actions.performNewSearch ).toBeInstanceOf( Function );
	} );

	describe( 'make an API request', () => {
		it( 'with the correct params for "image" type searches', () => {
			actions.performNewSearch( context );
			expect( global.mw.Api.prototype.get ).toHaveBeenCalledWith(
				expect.objectContaining( {
					action: 'query',
					format: 'json',
					generator: 'search',
					gsrsearch: `filetype:bitmap|drawing -fileres:0 ${ context.getters.currentSearchTerm }`,
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

		it( 'with the correct params for "page" type searches', () => {
			const allNamespaces = Object.keys( namespaceGroups.all ).join( '|' );
			context.getters.currentType = 'page';
			actions.performNewSearch( context );
			expect( global.mw.Api.prototype.get ).toHaveBeenCalledWith(
				expect.objectContaining( {
					action: 'query',
					format: 'json',
					generator: 'search',
					gsrsearch: `${ context.getters.currentSearchTerm }`,
					gsrnamespace: allNamespaces,
					gsrlimit: 40,
					gsroffset: 0,
					gsrinfo: 'totalhits|suggestion',
					gsrprop: 'size|wordcount|timestamp|snippet',
					prop: 'info|categoryinfo'
				} )
			);
		} );

		it( 'with the correct params for "other" type searches', () => {
			context.getters.currentType = 'other';
			actions.performNewSearch( context );
			expect( global.mw.Api.prototype.get ).toHaveBeenCalledWith(
				expect.objectContaining( {
					action: 'query',
					format: 'json',
					generator: 'search',
					gsrsearch: `filetype:multimedia|office|archive|3d -fileres:0 ${ context.getters.currentSearchTerm }`,
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

		it( 'with the correct params for "video" type searches', () => {
			context.getters.currentType = 'video';
			actions.performNewSearch( context );
			expect( global.mw.Api.prototype.get ).toHaveBeenCalledWith(
				expect.objectContaining( {
					action: 'query',
					format: 'json',
					generator: 'search',
					gsrsearch: `filetype:video -fileres:0 ${ context.getters.currentSearchTerm }`,
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

		it( 'with the correct gsrsearch param for "image" type searches when filterValues is undefined', () => {
			context.state.filterValues[ context.getters.currentType ] = undefined;

			actions.performNewSearch( context );
			expect( global.mw.Api.prototype.get ).toHaveBeenCalledWith(
				expect.objectContaining( {
					gsrsearch: `filetype:bitmap|drawing -fileres:0 ${ context.getters.currentSearchTerm }`
				} )
			);
		} );

		it( 'with sort parameter if specified in the filterValues', () => {
			context.state.filterValues[ context.getters.currentType ] = {
				sort: 'recency'
			};

			actions.performNewSearch( context );
			expect( global.mw.Api.prototype.get ).toHaveBeenCalledWith(
				expect.objectContaining( {
					gsrsort: 'create_timestamp_desc'
				} )
			);
		} );

		it( 'with mediasearch_ parameter if specified in the uriQuery', () => {
			context.state.uriQuery = {
				// eslint-disable-next-line camelcase
				mediasearch_1: 'mediasearch_test'
			};

			actions.performNewSearch( context );
			expect( global.mw.Api.prototype.get ).toHaveBeenCalledWith(
				expect.objectContaining( {
					// eslint-disable-next-line camelcase
					mediasearch_1: 'mediasearch_test'
				} )
			);
		} );
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
				pending: false,
				type: context.getters.currentType
			} );

			done();
		} );
	} );

	it( 'commits an "addResult" mutation for every result returned from the API', ( done ) => {
		actions.performNewSearch( context ).then( () => {
			const addResultCalls = context.commit.mock.calls.filter( ( call ) => call[ 0 ] === 'addResult' );
			expect(
				addResultCalls.length
			).toEqual(
				Object.keys( mockImageSearchApiResponse.query.pages ).length
			);
			done();
		} );
	} );

	it( 'prevent API request when there are no more result', ( done ) => {
		context.state.continue[ context.getters.currentType ] = null;

		actions.performNewSearch( context ).then( () => {
			expect( global.mw.Api.prototype.get ).not.toHaveBeenCalled();
			done();
		} );
	} );

	describe( 'when response includes warnings', () => {
		it( 'commits a "setSearchWarnings" mutation', ( done ) => {
			context.getters.currentType = 'image';
			global.mw.Api.prototype.get.mockReturnValue(
				$.Deferred().resolve( mockEmptyImageSearchApiWithWarningsResponse ).promise() );

			actions.performNewSearch( context ).then( () => {
				const setSearchWarnings = context.commit.mock.calls.filter( ( call ) => call[ 0 ] === 'setSearchWarnings' );
				expect( setSearchWarnings.length ).toEqual( 1 );
				done();
			} );
		} );
	} );

	describe( 'when response inludes suggestionInfo', () => {
		it( 'commits an "setDidYouMean" mutations', ( done ) => {

			context.getters.currentType = 'image';
			global.mw.Api.prototype.get.mockReturnValue(
				$.Deferred().resolve( mockEmptyImageSearchApiWithSuggestionResponse ).promise()
			);

			actions.performNewSearch( context ).then( () => {
				const setDidYouMean = context.commit.mock.calls.filter( ( call ) => call[ 0 ] === 'setDidYouMean' );
				expect( setDidYouMean.length ).toEqual( 1 );
				done();
			} );
		} );

		it( 'suggested term does not include filters', ( done ) => {

			context.getters.currentType = 'image';
			global.mw.Api.prototype.get.mockReturnValue(
				$.Deferred().resolve( mockEmptyImageSearchApiWithSuggestionResponse ).promise()
			);
			// we set the filter values state as expected by the code
			context.state.filterValues = {
				image: { filemime: 'jpeg' }
			};

			actions.performNewSearch( context ).then( () => {
				const setDidYouMean = context.commit.mock.calls.find( ( call ) => call[ 0 ] === 'setDidYouMean' );
				const suggestedTerm = setDidYouMean[ 1 ];
				expect( suggestedTerm ).not.toContain( 'jpeg' );
				expect( suggestedTerm ).not.toContain( 'filemime' );
				done();
			} );
		} );

		it( 'Handles errors successfully', ( done ) => {
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

		it( 'suggested term does not include assessments', ( done ) => {

			context.getters.currentType = 'image';
			global.mw.Api.prototype.get.mockReturnValue(
				$.Deferred().resolve( mockEmptyImageSearchApiWithSuggestionResponse ).promise()
			);
			// we set the assessment values state as expected by the code
			context.state.filterValues = {
				image: { assessment: 'any-assessment' }
			};

			actions.performNewSearch( context ).then( () => {
				const setDidYouMean = context.commit.mock.calls.find( ( call ) => call[ 0 ] === 'setDidYouMean' );
				const suggestedTerm = setDidYouMean[ 1 ];
				expect( suggestedTerm ).not.toContain( 'assessment' );
				expect( suggestedTerm ).not.toContain( 'any-assessment' );
				done();
			} );
		} );
	} );

} );

describe( 'searchMore', () => {

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

	it( 'will decreate autocounter', ( done ) => {
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
		it( 'will not decrease autocounter, if resetCounter argument is true', ( done ) => {
			context.getters.currentType = 'image';
			context.getters.allResultsEmpty = false;
			context.getters.checkForMore = {
				image: true
			};
			context.state.autoloadCounter = {
				image: 1
			};

			actions.searchMore( context, true ).then( () => {
				const decreaseAutoloadCounterForMediaTypeCalls = context.commit.mock.calls.filter( ( call ) => call[ 0 ] === 'decreaseAutoloadCounterForMediaType' );
				expect( decreaseAutoloadCounterForMediaTypeCalls.length ).toBe( 0 );
				done();
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
		expect( context.commit ).toHaveBeenCalledWith( 'clearSearchWarnings' );
	} );
} );

describe( 'ready', () => {

	it( 'commits the setInitialized mutation when called', () => {
		actions.ready( context );
		expect( context.commit ).toHaveBeenCalledWith( 'setInitialized' );
	} );
} );

describe( 'fetchDetails', () => {
	let options;

	beforeEach( () => {

		// Mocks for mw.config values
		when( global.mw.config.get ).calledWith( 'wgUserLanguage' ).mockReturnValue( 'en' );

		// Fake an API response
		global.mw.Api.prototype.get.mockReturnValue(
			$.Deferred().resolve( mockImageDetailsApiResponse ).promise()
		);

	} );

	it( 'makes an API request with the correct params for "image" type details search', () => {

		options = {
			title: 'dummy title',
			mediaType: 'image'
		};

		actions.fetchDetails( context, options );
		expect( global.mw.Api.prototype.get ).toHaveBeenCalledWith(
			expect.objectContaining( {
				action: 'query',
				format: 'json',
				uselang: 'en',
				inprop: 'url',
				titles: options.title,
				iiextmetadatalanguage: 'en',
				prop: 'info|imageinfo|entityterms',
				iiprop: 'url|size|mime|extmetadata',
				iiurlheight: 180
			} )
		);
	} );

	it( 'makes an API request with the correct params for "audio" type details search', () => {

		options = {
			title: 'dummy title',
			mediaType: 'audio'
		};

		actions.fetchDetails( context, options );
		expect( global.mw.Api.prototype.get ).toHaveBeenCalledWith(
			expect.objectContaining( {
				action: 'query',
				format: 'json',
				uselang: 'en',
				inprop: 'url',
				titles: options.title,
				iiextmetadatalanguage: 'en',
				prop: 'info|videoinfo|entityterms',
				viprop: 'url|size|mime|extmetadata|derivatives',
				viurlwidth: 640
			} )
		);
	} );

	it( 'makes an API request with the correct params for "video" type details search', () => {

		options = {
			title: 'dummy title',
			mediaType: 'video'
		};

		actions.fetchDetails( context, options );
		expect( global.mw.Api.prototype.get ).toHaveBeenCalledWith(
			expect.objectContaining( {
				action: 'query',
				format: 'json',
				uselang: 'en',
				inprop: 'url',
				titles: options.title,
				iiextmetadatalanguage: 'en',
				prop: 'info|videoinfo|entityterms',
				viprop: 'url|size|mime|extmetadata|derivatives',
				viurlwidth: 640
			} )
		);
	} );

	it( 'makes an API request with the correct params for "page" type details search', () => {

		options = {
			title: 'dummy title',
			mediaType: 'page'
		};

		actions.fetchDetails( context, options );
		expect( global.mw.Api.prototype.get ).toHaveBeenCalledWith(
			expect.objectContaining( {
				action: 'query',
				format: 'json',
				uselang: 'en',
				inprop: 'url',
				titles: options.title,
				iiextmetadatalanguage: 'en',
				prop: 'info|imageinfo|entityterms',
				iiprop: 'url|size|mime|extmetadata',
				iiurlheight: undefined
			} )
		);
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

describe( 'syncActiveTypeAndQueryType', () => {

	const dummySdmsInitialSearchResultsType = 'dummyType';

	beforeEach( () => {
		// Mocks for mw.config values
		when( global.mw.config.get ).calledWith( 'sdmsInitialSearchResults' ).mockReturnValue( {
			activeType: dummySdmsInitialSearchResultsType
		} );
	} );

	it( 'fetch active type from sdmsInitialSearchResults', () => {
		actions.syncActiveTypeAndQueryType( context );

		const sdmsInitialSearchResultsCall = global.mw.config.get.mock.calls.filter( ( call ) => call[ 0 ] === 'sdmsInitialSearchResults' );
		expect( sdmsInitialSearchResultsCall.length ).toEqual( 1 );
	} );

	describe( 'when sdmsInitialSearchResults and uriQuery.type missmatch', () => {

		it( 'commit a setCurrentType mutation', () => {
			actions.syncActiveTypeAndQueryType( context );

			const setCurrentTypeCall = context.commit.mock.calls.filter( ( call ) => call[ 0 ] === 'setCurrentType' );
			expect( setCurrentTypeCall.length ).toEqual( 1 );
		} );

		it( 'update type with sdmsInitialSearchResults value', () => {
			actions.syncActiveTypeAndQueryType( context );

			const setCurrentTypeCall = context.commit.mock.calls.filter( ( call ) => call[ 0 ] === 'setCurrentType' );
			expect( setCurrentTypeCall[ 0 ][ 1 ] ).toEqual( dummySdmsInitialSearchResultsType );
		} );
	} );

	describe( 'when sdmsInitialSearchResults and uriQuery.type match', () => {

		it( 'does not trigger setCurrentType commit', () => {

			context.state.uriQuery = {
				type: dummySdmsInitialSearchResultsType
			};

			actions.syncActiveTypeAndQueryType( context );

			const setCurrentTypeCall = context.commit.mock.calls.filter( ( call ) => call[ 0 ] === 'setCurrentType' );
			expect( setCurrentTypeCall.length ).toEqual( 0 );
		} );
	} );
} );
