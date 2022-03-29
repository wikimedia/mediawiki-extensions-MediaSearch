const mutations = require( '../../resources/store/mutations.js' ),
	initialState = require( './fixtures/initialVuexState.js' );

describe( 'mutations', () => {
	let state;

	beforeEach( () => {
		state = JSON.parse( JSON.stringify( initialState ) );
		window.scrollY = 0;
	} );

	afterEach( () => {
		state = null;
		jest.useRealTimers();
	} );

	describe( 'setSearchTerm', () => {
		it( 'assigns a new value to the "search" property in state.uriQuery', () => {
			const newTerm = 'cat';
			mutations.setSearchTerm( state, newTerm );
			expect( state.uriQuery.search ).toBe( newTerm );
		} );
	} );

	describe( 'clearTerm', () => {
		it( 'resets the "search" property to an empty string', () => {
			state.uriQuery.search = 'cat';
			mutations.clearTerm( state );
			expect( state.uriQuery.search ).toBe( '' );
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

	describe( 'setContinue', () => {
		it( 'sets the value of provided type within the continue object', () => {
			const dummyPayload = {
				type: 'dummyType',
				continue: 'dummyContinue'
			};
			mutations.setContinue( state, dummyPayload );
			expect( state.continue[ dummyPayload.type ] ).toBeTruthy();
			expect( state.continue[ dummyPayload.type ] ).toBe( dummyPayload.continue );
		} );
	} );

	describe( 'setPending', () => {
		it( 'sets the value of provided type within the pending object', () => {
			const dummyPayload = {
				type: 'dummyType',
				pending: 'dummyPending'
			};
			mutations.setPending( state, dummyPayload );
			expect( state.pending[ dummyPayload.type ] ).toBeTruthy();
			expect( state.pending[ dummyPayload.type ] ).toBe( dummyPayload.pending );
		} );
	} );

	describe( 'setTotalHits', () => {
		it( 'sets the value of provided mediatype within the totalHits object', () => {
			const dummyPayload = {
				mediaType: 'dummyType',
				totalHits: 10
			};
			mutations.setTotalHits( state, dummyPayload );
			expect( state.totalHits[ dummyPayload.mediaType ] ).toBeTruthy();
			expect( state.totalHits[ dummyPayload.mediaType ] ).toBe( dummyPayload.totalHits );
		} );
	} );

	describe( 'setDetails', () => {
		it( 'sets the value of provided mediatype within the details object', () => {
			const dummyPayload = {
				mediaType: 'dummyType',
				details: 10
			};
			mutations.setDetails( state, dummyPayload );
			expect( state.details[ dummyPayload.mediaType ] ).toBeTruthy();
			expect( state.details[ dummyPayload.mediaType ] ).toBe( dummyPayload.details );
		} );
	} );

	describe( 'clearDetails', () => {
		it( 'clears the value of provided mediatype within the details object', () => {
			const dummyPayload = {
				mediaType: 'dummyType'
			};
			state.details[ dummyPayload.mediaType ] = 'dummyValue';
			mutations.clearDetails( state, dummyPayload );
			expect( state.details[ dummyPayload.mediaType ] ).toBe( null );
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

	describe( 'setDidYouMean', () => {
		it( 'sets the value of didYouMean', () => {
			const dummyValue = 'dummyValue';
			mutations.setDidYouMean( state, dummyValue );
			expect( state.didYouMean ).toBe( dummyValue );
		} );
	} );

	describe( 'clearDidYouMean', () => {
		it( 'clears the value of didYouMean', () => {
			state.didYouMean = 'dummyValue';
			mutations.clearDidYouMean( state );
			expect( state.didYouMean ).toBe( null );
		} );
	} );

	describe( 'setDidYouMean', () => {
		it( 'sets the value of initialized to true', () => {
			mutations.setInitialized( state );
			expect( state.initialized ).toBe( true );
		} );
	} );

	describe( 'stashPageState', () => {

		it( 'calls setObject on the MW storage object with values from the state', () => {
			state = {
				results: 'result',
				continue: 'continue',
				totalHits: 'totalHits',
				details: 'details',
				scrollY: 0
			};

			mutations.stashPageState( state );
			expect( mw.storage.setObject ).toHaveBeenCalled();
			expect( mw.storage.setObject.mock.calls[ 0 ][ 1 ] ).toMatchObject( state );

		} );

		it( 'calls setObject on the MW storage using scrollY from windows', () => {
			state = {
				scrollY: 100
			};
			window.scrollY = state.scrollY;

			mutations.stashPageState( state );
			expect( mw.storage.setObject ).toHaveBeenCalled();
			expect( mw.storage.setObject.mock.calls[ 0 ][ 1 ].scrollY ).toBe( state.scrollY );

		} );
	} );

	describe( 'restorePageState', () => {
		it( 'restore the store with stashed values', () => {
			const stash = {
				results: {
					dummy: 'result'
				},
				continue: {
					dummy: 'continue'
				},
				totalHits: {
					dummy: 'totalHits'
				},
				filterValues: {
					dummy: 'filterValues'
				},
				details: {
					dummy: 'details'
				}
			};

			state = {
				results: {},
				continue: {},
				totalHits: {},
				filterValues: {},
				details: {}
			};

			mw.storage.getObject.mockReturnValue( stash );

			mutations.restorePageState( state );
			expect( state.results ).toMatchObject( stash.results );
			expect( state.continue ).toMatchObject( stash.continue );
			expect( state.totalHits ).toMatchObject( stash.totalHits );
			expect( state.filterValues ).toMatchObject( stash.filterValues );
			expect( state.details ).toMatchObject( stash.details );
		} );

		it( 'restore the scroll position from stashed value', () => {
			const stash = {
				results: {},
				continue: {},
				totalHits: {},
				details: {},
				filterValues: {},
				scrollY: 1000
			};

			state = {
				results: {},
				continue: {},
				totalHits: {},
				details: {},
				filterValues: {},
				scrollY: 0
			};

			jest.useFakeTimers();
			window.scroll = jest.fn();

			mw.storage.getObject.mockReturnValue( stash );
			mutations.restorePageState( state );

			jest.runAllTimers();

			expect( window.scroll ).toHaveBeenCalled();
			expect( window.scroll ).toHaveBeenCalledWith( 0, stash.scrollY );
		} );
	} );

	describe( 'clearStoredPageState', () => {
		it( 'removes stashed values from mw storage', () => {

			mutations.clearStoredPageState();

			expect( mw.storage.remove ).toHaveBeenCalled();
		} );
	} );

	describe( 'clearFilterQueryParams', () => {
		it( 'delete all filter query params from the uriQuery object', () => {
			state = {
				filterValues: {
					fakeType: {
						dummy1: 'test',
						dummy2: 'test'
					},
					fakeType2: {
						dummy3: 'test',
						dummy4: 'test'
					}
				},
				uriQuery: {
					dummy1: 'test',
					dummy2: 'test',
					dummy3: 'test',
					dummy4: 'test'
				}
			};

			mutations.clearFilterQueryParams( state );

			expect( state ).toMatchObject( {} );
		} );
	} );

	describe( 'updateFilterQueryParams', () => {
		it( 'update all the filters with the provided object', () => {
			state = {
				uriQuery: {
					dummy1: '',
					dummy2: '',
					dummy3: '',
					dummy4: ''
				}
			};

			const newValues = {
				dummy1: 'test1',
				dummy2: 'test2',
				dummy3: 'test3',
				dummy4: 'test4'
			};

			mutations.updateFilterQueryParams( state, newValues );

			expect( state.uriQuery ).toMatchObject( newValues );
		} );
	} );

	describe( 'setCurrentType', () => {
		it( 'sets the uriQuery.type paramether to the media type provided', () => {
			const newType = 'dummy';

			state = {
				uriQuery: {
					type: ''
				},
				results: {
					dummy: {}
				}
			};

			mutations.setCurrentType( state, newType );

			expect( state.uriQuery.type ).toBe( newType );
		} );
		it( 'does not set the value if type provided is null', () => {
			const newType = null;

			state = {
				uriQuery: {
					type: ''
				},
				results: {
					dummy: {}
				}
			};

			mutations.setCurrentType( state, newType );

			expect( state.uriQuery.type ).not.toBe( newType );
		} );
		it( 'does not set the value if type provided is not one of the results key', () => {
			const newType = 'anotherDummy';

			state = {
				uriQuery: {
					type: ''
				},
				results: {
					dummy: {}
				}
			};

			mutations.setCurrentType( state, newType );

			expect( state.uriQuery.type ).not.toBe( newType );
		} );
	} );

	describe( 'updateOrDeleteQueryParam', () => {
		it( 'updates the uriQuery params when a value is set', () => {
			const newParams = {
				key: 'dummyKey',
				value: 'dummyValue'
			};

			state = {
				uriQuery: {}
			};

			mutations.updateOrDeleteQueryParam( state, newParams );

			expect( state.uriQuery[ newParams.key ] ).toBe( newParams.value );
		} );

		it( 'deletes the uriQuery params when a value is falsy', () => {
			const newParams = {
				key: 'dummyKey',
				value: null
			};

			state = {
				uriQuery: {}
			};

			mutations.updateOrDeleteQueryParam( state, newParams );

			expect( state.uriQuery[ newParams.key ] ).toBe( undefined );
		} );
	} );

	describe( 'resetAutoLoadForAllMediaType', () => {
		it( 'reset the autoload state object for all media type', () => {
			// 2 is the defined constant
			const expectedResult = {
				image: 2,
				audio: 2,
				video: 2,
				page: 2,
				other: 2
			};

			mutations.resetAutoLoadForAllMediaType( state );
			expect( state.autoloadCounter ).toMatchObject( expectedResult );
		} );
	} );

	describe( 'resetAutoLoadForMediaType', () => {
		it( 'reset the autoload state object for a specific MediaType', () => {
			const expectedValue = 2;

			mutations.resetAutoLoadForMediaType( state, 'image' );
			expect( state.autoloadCounter.image ).toBe( expectedValue );
		} );

		it( 'does not change the other media types', () => {
			// 2 is the defined constant
			const expectedValue = 0;

			mutations.resetAutoLoadForMediaType( state, 'image' );
			expect( state.autoloadCounter.audio ).toBe( expectedValue );
			expect( state.autoloadCounter.video ).toBe( expectedValue );
			expect( state.autoloadCounter.page ).toBe( expectedValue );
			expect( state.autoloadCounter.other ).toBe( expectedValue );
		} );
	} );

	describe( 'decreaseAutoloadCounterForMediaType', () => {
		it( 'does not decrease the autoload if value is 0', () => {
			// 2 is the defined constant
			const expectedValue = 0;

			expect( state.autoloadCounter.image ).toBe( expectedValue );
			mutations.decreaseAutoloadCounterForMediaType( state, 'image' );
			expect( state.autoloadCounter.image ).toBe( expectedValue );
		} );

		it( 'decrease the autoload state object for a specific MediaType', () => {
			state.autoloadCounter.image = 2;
			const expectedValue = 1;

			mutations.decreaseAutoloadCounterForMediaType( state, 'image' );
			expect( state.autoloadCounter.image ).toBe( expectedValue );
		} );
	} );
} );
