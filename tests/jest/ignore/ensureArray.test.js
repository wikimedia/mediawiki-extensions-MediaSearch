const ensureArray = require( '../../resources/ensureArray.js' );
const searchResultData = require( './fixtures/mockImageSearchApiResponse.json' ).query.pages;
const dict = { a: 'apple', b: 'banana', c: 'canteloupe' };
const simpleArray = [ 'foo', 'bar', 'baz' ];
const deeperArray = [
	{ name: 'Alice', id: 1 },
	{ name: 'Bob', id: 2 },
	{ name: 'Charlie', id: 3 }
];

describe( 'ensureArray helper function', () => {
	it( 'returns arrays unchanged', () => {
		expect( ensureArray( simpleArray ) ).toEqual( simpleArray );
		expect( ensureArray( deeperArray ) ).toEqual( deeperArray );
		expect(
			ensureArray( [ searchResultData[ 0 ], searchResultData[ 1 ] ] )
		).toEqual(
			[ searchResultData[ 0 ], searchResultData[ 1 ] ]
		);
	} );

	it( 'returns an array of values when given an object', () => {
		// We can't use Object.values in the code we ship due to compatibility
		// but it's fine in tests
		/* eslint-disable es-x/no-object-values, compat/compat */
		expect( ensureArray( dict ) ).toEqual( Object.values( dict ) );
		// eslint-disable-next-line compat/compat, es-x/no-object-values
		expect( ensureArray( searchResultData ) ).toEqual( Object.values( searchResultData ) );
		/* eslint-enable es-x/no-object-values, compat/compat */
	} );
} );
