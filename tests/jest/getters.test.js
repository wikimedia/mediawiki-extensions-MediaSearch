/*!
 * WikiLambda unit test suite for the root Vuex getters
 *
 * @copyright 2020–2021 WikiLambda team; see AUTHORS.txt
 * @license MIT
 */

'use strict';

var getters = require( '../../resources/store/getters.js' );

describe( 'Vuex root getters', () => {
	describe( 'checkForMore', () => {
		it( 'return false for a specific mediaType if continue value if null', () => {
			var mockedState = {
				continue: {
					image: null
				}
			};

			expect( getters.checkForMore( mockedState ).image ).toEqual( false );
		} );
		it( 'return true for a specific mediaType if continue value if undefined', () => {
			var mockedState = {
				continue: {
					image: null,
					video: undefined
				}
			};

			expect( getters.checkForMore( mockedState ).video ).toEqual( true );
		} );
		it( 'return true for a specific mediaType if continue value if not undefined', () => {
			var mockedState = {
				continue: {
					image: null
				}
			};

			expect( getters.checkForMore( mockedState ).video ).toEqual( true );
		} );
	} );
	describe( 'allActiveFilters', () => {
		it( 'return stringified value of filter values', () => {
			var mockedState = {
				filterValues: {
					dummy: 'dummy'
				}
			};

			expect( getters.allActiveFilters( mockedState ) ).toEqual( JSON.stringify( mockedState.filterValues ) );
		} );
	} );
	describe( 'allActiveDetails', () => {
		it( 'return stringified value of details values', () => {
			var mockedState = {
				details: {
					dummy: 'dummy'
				}
			};

			expect( getters.allActiveDetails( mockedState ) ).toEqual( JSON.stringify( mockedState.details ) );
		} );
	} );
	describe( 'currentSearchTerm', () => {
		it( 'Returns empty string if search value is not set', () => {
			var mockedState = {
				uriQuery: {}
			};

			expect( getters.currentSearchTerm( mockedState ) ).toEqual( '' );
		} );

		it( 'Returns last item as current search term if search is array', () => {
			var mockedState = {
				uriQuery: {
					search: [ 'cat', 'cat' ]
				}
			};

			expect( getters.currentSearchTerm( mockedState ) ).toEqual( 'cat' );
		} );

		it( 'Returns string for current search term if search is string', () => {
			var mockedState = {
				uriQuery: {
					search: 'cat'
				}
			};

			expect( getters.currentSearchTerm( mockedState ) ).toEqual( 'cat' );
		} );
	} );

	describe( 'currentType', () => {
		it( 'returns uriQuery.type if available', () => {
			var mockedState = {
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
			var mockedState = {
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
			var mockedState = {
				results: {
					firstMedia: [],
					secondMedia: []
				}
			};
			expect( getters.allResultsEmpty( mockedState ) ).toEqual( true );
		} );

		it( 'returns false if any of the result is not empty', () => {
			var mockedState = {
				results: {
					firstMedia: [],
					secondMedia: [ 'dummy' ]
				}
			};
			expect( getters.allResultsEmpty( mockedState ) ).toEqual( false );
		} );
	} );

} );
