const mutations = require( '../../resources/store/mutations.js' ),
	initialState = require( './fixtures/initialVuexState.js' );

let state;

beforeEach( () => {
	state = initialState;
} );

describe( 'setTerm', () => {
	it( 'assigns a new value to the "term" property in state', () => {
		const newTerm = 'cat';
		mutations.setTerm( state, newTerm );
		expect( state.term ).toBe( newTerm );
	} );
} );

describe( 'clearTerm', () => {
	it( 'resets the "term" property to an empty string', () => {
		state.term = 'cat';
		mutations.clearTerm( state );
		expect( state.term ).toBe( '' );
	} );
} );

describe( 'setHasError', () => {
	it( 'sets the error state to the new value', () => {
		mutations.setHasError( state, true );
		expect( state.hasError ).toBe( true );

		mutations.setHasError( state, false );
		expect( state.hasError ).toBe( false );
	} );
} );

describe( 'addResult', () => {
	it( 'adds an individual result item to the array of the appropriate type', () => {
		const resultItem = { foo: 'bar' };
		const currentType = 'image';

		mutations.addResult( state, { type: currentType, item: resultItem } );
		expect( state.results[ currentType ].length ).toBe( 1 );
		expect( state.results[ currentType ][ 0 ] ).toEqual( resultItem );
	} );
} );

describe( 'resetResults', () => {
	describe( 'when a payload is provided', () => {
		it( 'resets results, continue, and totalHits properties for the appropriate type', () => {
			const resultItem = { foo: 'bar' };
			const currentType = 'image';
			const secondType = 'video';

			// Set up some data to ensure it is properly cleared
			mutations.addResult( state, { type: currentType, item: resultItem } );
			mutations.setContinue( state, { type: currentType, continue: 'gsroffset||' } );
			mutations.setTotalHits( state, { mediaType: currentType, totalHits: 12345 } );

			// Add data in another tab to ensure it is not cleared
			mutations.addResult( state, { type: secondType, item: resultItem } );

			// Clear the current type
			mutations.resetResults( state, currentType );

			// Expect the data for the current type to be reset, while second type is preserved
			expect( state.results[ currentType ] ).toEqual( [] );
			expect( state.continue[ currentType ] ).toBe( undefined );
			expect( state.totalHits[ currentType ] ).toBe( 0 );
			expect( state.results[ secondType ] ).toEqual( [ resultItem ] );
		} );
	} );

	describe( 'when no payload is provided', () => {
		it( 'resets results, continue, and totalHits properties for all types', () => {
			const resultItem = { foo: 'bar' };
			const currentType = 'image';
			const secondType = 'video';

			// Set up some data to ensure it is properly cleared
			mutations.addResult( state, { type: currentType, item: resultItem } );
			mutations.setContinue( state, { type: currentType, continue: 'gsroffset||' } );
			mutations.setTotalHits( state, { mediaType: currentType, totalHits: 12345 } );

			// Add data in another tab to ensure it is also cleared
			mutations.addResult( state, { type: secondType, item: resultItem } );

			// Clear data for all types
			mutations.resetResults( state );

			// Expect the data for the current type and second type to be reset
			expect( state.results[ currentType ] ).toEqual( [] );
			expect( state.continue[ currentType ] ).toBe( undefined );
			expect( state.totalHits[ currentType ] ).toBe( 0 );
			expect( state.results[ secondType ] ).toEqual( [] );
		} );
	} );
} );

describe( 'addFilterValue', () => {
	it( 'adds a new key-value pair for the appropriate media type', () => {
		const filterType = 'foo';
		const filterValue = 'bar';
		const currentType = 'image';

		mutations.addFilterValue( state, {
			mediaType: currentType,
			filterType: filterType,
			value: filterValue
		} );

		expect( state.filterValues[ currentType ] ).toBeInstanceOf( Object );
		expect( Object.keys( state.filterValues[ currentType ] ) ).toHaveLength( 1 );
		expect( state.filterValues[ currentType ][ filterType ] ).toBe( filterValue );
	} );
} );

describe( 'removeFilterValue', () => {
	it( 'removes the specified key-value pair from the appropriate media type', () => {
		const filterType = 'foo';
		const filterValue = 'bar';
		const secondFilterType = 'baz';
		const secondFilterValue = 'quux';
		const currentType = 'image';

		// Set up some data to remove
		mutations.addFilterValue( state, {
			mediaType: currentType,
			filterType: filterType,
			value: filterValue
		} );

		mutations.addFilterValue( state, {
			mediaType: currentType,
			filterType: secondFilterType,
			value: secondFilterValue
		} );

		expect( state.filterValues[ currentType ][ filterType ] ).toBe( filterValue );
		expect( state.filterValues[ currentType ][ secondFilterType ] ).toBe( secondFilterValue );
		expect( Object.keys( state.filterValues[ currentType ] ) ).toHaveLength( 2 );

		// Test that only the appropriate data is removed
		mutations.removeFilterValue( state, {
			mediaType: currentType,
			filterType: filterType
		} );

		expect( Object.keys( state.filterValues[ currentType ] ) ).toHaveLength( 1 );
		expect( state.filterValues[ currentType ][ secondFilterType ] ).toBe( secondFilterValue );
	} );
} );

describe( 'resetFilters', () => {
	it( 'Resets all filters across all types to empty values', () => {
		const filterType = 'foo';
		const filterValue = 'bar';
		const secondFilterType = 'baz';
		const secondFilterValue = 'quux';
		const currentType = 'image';
		const secondType = 'video';

		// Set up some data to remove
		mutations.addFilterValue( state, {
			mediaType: currentType,
			filterType: filterType,
			value: filterValue
		} );

		mutations.addFilterValue( state, {
			mediaType: currentType,
			filterType: secondFilterType,
			value: secondFilterValue
		} );

		mutations.addFilterValue( state, {
			mediaType: secondType,
			filterType: filterType,
			value: filterValue
		} );

		mutations.resetFilters( state );
		expect( state.filterValues[ currentType ] ).toEqual( {} );
		expect( state.filterValues[ secondType ] ).toEqual( {} );
	} );
} );
