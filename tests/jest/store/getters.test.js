/*!
 * WikiLambda unit test suite for the root Vuex getters
 *
 * @copyright 2020–2021 WikiLambda team; see AUTHORS.txt
 * @license MIT
 */

'use strict';

const getters = require( '../../../resources/store/getters.js' );

describe( 'Vuex root getters', () => {
	describe( 'checkForMore', () => {
		it( 'return false for a specific mediaType if continue value if null', () => {
			const mockedState = {
				continue: {
					image: null
				}
			};

			expect( getters.checkForMore( mockedState ).image ).toEqual( false );
		} );
		it( 'return true for a specific mediaType if continue value if undefined', () => {
			const mockedState = {
				continue: {
					image: null,
					video: undefined
				}
			};

			expect( getters.checkForMore( mockedState ).video ).toEqual( true );
		} );
		it( 'return true for a specific mediaType if continue value if not undefined', () => {
			const mockedState = {
				continue: {
					image: null
				}
			};

			expect( getters.checkForMore( mockedState ).video ).toEqual( true );
		} );
	} );
	describe( 'allActiveFilters', () => {
		it( 'return stringified value of filter values', () => {
			const mockedState = {
				filterValues: {
					dummy: 'dummy'
				}
			};

			expect( getters.allActiveFilters( mockedState ) ).toEqual(
				JSON.stringify( mockedState.filterValues )
			);
		} );
	} );
	describe( 'allActiveDetails', () => {
		it( 'return stringified value of details values', () => {
			const mockedState = {
				details: {
					dummy: 'dummy'
				}
			};

			expect( getters.allActiveDetails( mockedState ) ).toEqual(
				JSON.stringify( mockedState.details )
			);
		} );
	} );
	describe( 'currentSearchTerm', () => {
		it( 'Returns empty string if search value is not set', () => {
			const mockedState = {
				uriQuery: {}
			};

			expect( getters.currentSearchTerm( mockedState ) ).toEqual( '' );
		} );

		it( 'Returns last item as current search term if search is array', () => {
			const mockedState = {
				uriQuery: {
					search: [ 'cat', 'cat' ]
				}
			};

			expect( getters.currentSearchTerm( mockedState ) ).toEqual( 'cat' );
		} );

		it( 'Returns string for current search term if search is string', () => {
			const mockedState = {
				uriQuery: {
					search: 'cat'
				}
			};

			expect( getters.currentSearchTerm( mockedState ) ).toEqual( 'cat' );
		} );
	} );

	describe( 'currentType', () => {
		it( 'returns uriQuery.type if available', () => {
			const mockedState = {
				uriQuery: {
					type: 'image'
				},
				results: {
					firstMedia: []
				}
			};

			expect( getters.currentType( mockedState ) ).toEqual( 'image' );
		} );

		it( 'returns first mediatype if uriQuery.type is not available', () => {
			const mockedState = {
				uriQuery: { },
				results: {
					firstMedia: [],
					secondMedia: []
				}
			};
			expect( getters.currentType( mockedState ) ).toEqual( 'firstMedia' );
		} );
	} );

	describe( 'allResultsEmpty', () => {
		it( 'returns true if results are all empty', () => {
			const mockedState = {
				results: {
					firstMedia: [],
					secondMedia: []
				}
			};
			expect( getters.allResultsEmpty( mockedState ) ).toEqual( true );
		} );

		it( 'returns false if any of the result is not empty', () => {
			const mockedState = {
				results: {
					firstMedia: [],
					secondMedia: [ 'dummy' ]
				}
			};
			expect( getters.allResultsEmpty( mockedState ) ).toEqual( false );
		} );
	} );

} );
