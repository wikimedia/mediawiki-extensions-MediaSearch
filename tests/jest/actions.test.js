const actions = require( '../../resources/store/actions.js' ),
	initialState = require( './fixtures/initialVuexState.js' ),
	namespaceGroups = require( './fixtures/namespaceGroups.js' ),
	mockImageSearchApiResponse = require( './fixtures/mockImageSearchApiResponse.json' ),
	thumbRenderMap = [ 320, 640, 800, 1024, 1280, 1920 ],
	when = require( 'jest-when' ).when;
require( './mocks/history.js' );

describe( 'search', () => {
	let context, options;

	beforeEach( () => {
		// Fake Vuex context object
		// (see: https://vuex.vuejs.org/api/#actions)
		context = {
			state: initialState,
			commit: jest.fn(),
			dispatch: jest.fn()
		};

		// Search term & type
		options = {
			term: 'cat',
			type: 'image'
		};

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
		expect( actions.search ).toBeInstanceOf( Function );
	} );

	it( 'makes an API request with the correct params for "image" type searches', () => {
		actions.search( context, options );
		expect( global.mw.Api.prototype.get ).toHaveBeenCalledWith(
			expect.objectContaining( {
				action: 'query',
				format: 'json',
				generator: 'search',
				gsrsearch: `filetype:bitmap|drawing ${options.term}`,
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
		options.type = 'page';
		actions.search( context, options );
		expect( global.mw.Api.prototype.get ).toHaveBeenCalledWith(
			expect.objectContaining( {
				action: 'query',
				format: 'json',
				generator: 'search',
				gsrsearch: `${options.term}`,
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
		options.type = 'other';
		actions.search( context, options );
		expect( global.mw.Api.prototype.get ).toHaveBeenCalledWith(
			expect.objectContaining( {
				action: 'query',
				format: 'json',
				generator: 'search',
				gsrsearch: `filetype:multimedia|office|archive|3d ${options.term}`,
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
		options.type = 'video';
		actions.search( context, options );
		expect( global.mw.Api.prototype.get ).toHaveBeenCalledWith(
			expect.objectContaining( {
				action: 'query',
				format: 'json',
				generator: 'search',
				gsrsearch: `filetype:video ${options.term}`,
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
		context.state.filterValues[ options.type ] = undefined;

		actions.search( context, options );
		expect( global.mw.Api.prototype.get ).toHaveBeenCalledWith(
			expect.objectContaining( {
				gsrsearch: `filetype:bitmap|drawing ${options.term}`
			} )
		);
	} );

	it( 'sets the pending state to true when dispatched', () => {
		actions.search( context, options );
		expect( context.commit ).toHaveBeenCalledWith( 'setPending', {
			pending: true,
			type: options.type
		} );
	} );

	it( 'resets the error state to false when dispatched', () => {
		actions.search( context, options );
		expect( context.commit ).toHaveBeenCalledWith( 'setHasError', false );
	} );

	it( 'sets the pending state to false when the request is complete', done => {
		actions.search( context, options ).then( () => {
			expect( context.commit ).toHaveBeenCalledWith( 'setPending', {
				pending: false,
				type: options.type
			} );

			done();
		} );
	} );

	it( 'commits an "addResult" mutation for every result returned from the API', done => {
		actions.search( context, options ).then( () => {
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
			promise = deferred.promise();

		global.mw.Api.prototype.get.mockReturnValue( promise );
		actions.search( context, options );

		promise.then( () => {
			// We only care about errors here, so do nothing
		} ).catch( () => {
			expect( context.commit ).toHaveBeenCalledWith( 'setHasError', true );
		} ).always( () => {
			expect( context.commit ).toHaveBeenCalledWith( 'setPending', {
				type: options.type,
				pending: false
			} );
			done();
		} );

		// This is our "trigger" so that our code above executes
		deferred.reject( {} );
	} );
} );

describe( 'clear', () => {
	let context;

	beforeEach( () => {
		context = {
			state: initialState,
			commit: jest.fn(),
			dispatch: jest.fn()
		};
	} );

	it( 'commits all the expected mutations when called', () => {
		actions.clear( context );
		expect( context.commit ).toHaveBeenCalledWith( 'clearTerm' );
		expect( context.commit ).toHaveBeenCalledWith( 'resetFilters' );
		expect( context.commit ).toHaveBeenCalledWith( 'resetResults' );
		expect( context.commit ).toHaveBeenCalledWith( 'clearDidYouMean' );
	} );
} );

describe( 'ready', () => {
	let context;

	beforeEach( () => {
		context = {
			state: initialState,
			commit: jest.fn(),
			dispatch: jest.fn()
		};
	} );

	it( 'commits the setInitialized mutation when called', () => {
		actions.ready( context );
		expect( context.commit ).toHaveBeenCalledWith( 'setInitialized' );
	} );
} );

describe( 'pushQueryToHistoryState', () => {
	let context;

	beforeEach( () => {
		context = {
			state: initialState,
			commit: jest.fn(),
			dispatch: jest.fn()
		};
	} );

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
	let context;

	beforeEach( () => {
		context = {
			state: initialState,
			commit: jest.fn(),
			dispatch: jest.fn()
		};
	} );

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
	let context;

	beforeEach( () => {
		context = {
			state: initialState,
			getters: {
				currentType: 'dummy'
			},
			commit: jest.fn(),
			dispatch: jest.fn()
		};
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
	let context;

	beforeEach( () => {
		context = {
			state: initialState,
			commit: jest.fn(),
			dispatch: jest.fn()
		};
	} );

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
