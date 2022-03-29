/*!
 * WikiLambda unit test suite for the root Vuex store
 *
 * @copyright 2020–2021 WikiLambda team; see AUTHORS.txt
 * @license MIT
 */

'use strict';

var when = require( 'jest-when' ).when;

let state,
	activeType = 'audio',
	ensureArrayMock = jest.fn();

const initializeMocks = ( options => {
	// we set the return of ensureArray to the result if available
	ensureArrayMock.mockReturnValue( options.sdmsInitialSearchResults.results || [] );
	for ( let key in options ) {
		when( global.mw.config.get ).calledWith( key ).mockReturnValue( options[ key ] );
	}
	jest.mock( '../../resources/ensureArray.js', () => ensureArrayMock );
	state = require( '../../resources/store/state.js' );

} );

describe( 'Vuex root state', () => {

	beforeEach( () => {
		jest.resetAllMocks();
		jest.resetModules();
	} );

	afterEach( () => {
		state = null;
		global.mw.config.get = jest.fn();
	} );

	describe( 'didYouMean', () => {

		it( 'return config sdmsDidYouMean', () => {

			initializeMocks( {
				sdmsInitialFilters: '{}',
				sdmsInitialSearchResults: {
					activeType: activeType
				},
				sdmsDidYouMean: 'didYouMean'
			} );
			expect( state.didYouMean ).toBe( 'didYouMean' );
		} );
	} );

	describe( 'hasError', () => {

		it( 'return config sdmsHasError', () => {
			initializeMocks( {
				sdmsInitialFilters: '{}',
				sdmsInitialSearchResults: {
					activeType: activeType
				},
				sdmsHasError: 'hasError'
			} );
			expect( state.hasError ).toBe( 'hasError' );
		} );
	} );

	describe( 'results', () => {
		it( 'return an empty array if result is not set', () => {

			initializeMocks( {
				sdmsInitialFilters: '{}',
				sdmsInitialSearchResults: {
					activeType: activeType
				}
			} );

			expect( state.results.audio ).toEqual( [] );

		} );
		it( 'return sdmsInitialSearchResults for active type', () => {

			const mockResult = [
				{ index: 1, title: 'foo' },
				{ index: 2, title: 'bar' }
			];
			initializeMocks( {
				sdmsInitialFilters: '{}',
				sdmsInitialSearchResults: {
					activeType: activeType,
					results: mockResult
				}
			} );

			expect( state.results.audio ).toEqual( mockResult );

		} );
		it( 'return empty for non active type', () => {

			const mockResult = [
				{ index: 1, title: 'foo' },
				{ index: 2, title: 'bar' }
			];
			initializeMocks( {
				sdmsInitialFilters: '{}',
				sdmsInitialSearchResults: {
					activeType: activeType,
					results: mockResult
				}
			} );

			expect( state.results[ activeType ] ).toEqual( mockResult );
			expect( state.results.video ).toEqual( [] );

		} );
	} );

	describe( 'continue', () => {
		it( 'return undefined if mediatype continue value is not set', () => {

			initializeMocks( {
				sdmsInitialFilters: '{}',
				sdmsInitialSearchResults: {
					activeType: activeType
				}
			} );

			expect( state.continue[ activeType ] ).toEqual( undefined );
		} );
		it( 'return null if mediatype continue value is set to null', () => {

			initializeMocks( {
				sdmsInitialFilters: '{}',
				sdmsInitialSearchResults: {
					activeType: activeType,
					continue: null
				}
			} );

			expect( state.continue[ activeType ] ).toEqual( null );
		} );
		it( 'return undefined for non active media type', () => {

			initializeMocks( {
				sdmsInitialFilters: '{}',
				sdmsInitialSearchResults: {
					activeType: activeType,
					continue: null
				}
			} );

			expect( state.continue[ activeType ] ).toEqual( null );
			expect( state.continue.video ).toEqual( undefined );
		} );
		it( 'return the continue offset of the active Media type', () => {

			initializeMocks( {
				sdmsInitialFilters: '{}',
				sdmsInitialSearchResults: {
					activeType: activeType,
					continue: 'dummy'
				}
			} );

			expect( state.continue[ activeType ] ).toEqual( 'dummy' );
		} );
	} );

	describe( 'totalHits', () => {
		it( 'return totalHits value for current active type', () => {

			initializeMocks( {
				sdmsInitialFilters: '{}',
				sdmsInitialSearchResults: {
					activeType: activeType,
					totalHits: 100
				}
			} );

			expect( state.totalHits[ activeType ] ).toEqual( 100 );
		} );
		it( 'return 0 for non active media type', () => {

			initializeMocks( {
				sdmsInitialFilters: '{}',
				sdmsInitialSearchResults: {
					activeType: activeType,
					totalHits: 100
				}
			} );

			expect( state.totalHits.video ).toEqual( 0 );
		} );
	} );

	describe( 'filterValues', () => {
		it( 'return initialFilters value for current active type', () => {
			const dummyFilter = { dummy: 'dummy' };
			initializeMocks( {
				sdmsInitialFilters: JSON.stringify( dummyFilter ),
				sdmsInitialSearchResults: {
					activeType: activeType
				}
			} );

			expect( state.filterValues[ activeType ] ).toEqual( dummyFilter );
		} );
		it( 'return {} for non active media type', () => {
			const dummyFilter = { dummy: 'dummy' };
			initializeMocks( {
				sdmsInitialFilters: JSON.stringify( dummyFilter ),
				sdmsInitialSearchResults: {
					activeType: activeType
				}
			} );

			expect( state.filterValues.video ).toEqual( {} );
		} );
	} );
} );
