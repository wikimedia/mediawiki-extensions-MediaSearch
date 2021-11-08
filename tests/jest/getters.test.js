/*!
 * WikiLambda unit test suite for the root Vuex getters
 *
 * @copyright 2020–2021 WikiLambda team; see AUTHORS.txt
 * @license MIT
 */

'use strict';

var getters = require( '../../resources/store/getters.js' );

describe( 'Vuex root getters', () => {

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
