const Vuex = require( 'vuex' ),
	VueTestUtils = require( '@vue/test-utils' ),
	Vue = require( 'vue' ),
	when = require( 'jest-when' ).when,
	i18n = require( '../plugins/i18n.js' ),
	UserNotice = require( '../../../resources/components/UserNotice.vue' ),
	SdAutocompleteSearchInput = require( '../../../resources/components/base/AutocompleteSearchInput.vue' ),
	SdTab = require( '../../../resources/components/base/Tab.vue' ),
	SdTabs = require( '../../../resources/components/base/Tabs.vue' ),
	SearchResults = require( '../../../resources/components/SearchResults.vue' ),
	SearchFilters = require( '../../../resources/components/SearchFilters.vue' ),
	DidYouMean = require( '../../../resources/components/DidYouMean.vue' ),
	Observer = require( '../../../resources/components/base/Observer.vue' );

const localVue = VueTestUtils.createLocalVue();
localVue.use( Vuex );
localVue.use( i18n );

when( global.mw.config.get )
	.calledWith( 'sdmsInitialSearchResults' )
	.mockReturnValue( {
		tabs: [
			{ type: 'dummyTab1' },
			{ type: 'dummyTab2' }
		]
	} );
const initialState = {
	autoloadCounter: {
		dummyTab1: 2
	},
	results: {
		dummyTab1: [ 'fakeReturn' ]
	},
	dummyCurrentType: 'dummyTab1',
	dummySearchTerm: 'dummySearchTerm',
	dummyAllFilter: 'dummyAllFilter'
};

jest.mock( '../../../resources/mixins/restoreHistoryHandler.js' );
jest.mock( '../../../resources/mixins/autocompleteLookupHandler.js' );

const App = require( '../../../resources/components/App.vue' );
const renderComponent = ( store ) => {
	return VueTestUtils.shallowMount( App, {
		store: store,
		localVue: localVue,
		stubs: {
			'sd-tabs': true,
			'sd-tab': true,
			'sd-autocomplete-search-input': true,
			'search-results': true,
			'search-filters': true,
			'did-you-mean': true,
			'search-user-notice': true,
			observer: true
		},
		mocks: {
			$log: jest.fn()
		}
	} );
};

describe( 'App', () => {
	let store,
		state,
		getters,
		actions,
		mutations;

	beforeEach( () => {
		state = JSON.parse( JSON.stringify( initialState ) );
		getters = {
			allActiveFilters: jest.fn( () => {
				return state.dummyAllFilter;
			} ),
			currentType: jest.fn( () => {
				return state.dummyCurrentType;
			} ),
			currentSearchTerm: jest.fn( () => {
				return state.dummySearchTerm;
			} )
		};
		mutations = {
			clearDidYouMean: jest.fn(),
			resetResults: jest.fn(),
			resetAutoLoadForAllMediaType: jest.fn(),
			setHasError: jest.fn(),
			setPending: jest.fn(),
			setSearchTerm: jest.fn(),
			updateOrDeleteQueryParam: jest.fn()
		};
		actions = {
			clear: jest.fn(),
			syncActiveTypeAndQueryType: jest.fn(),
			pushQueryToHistoryState: jest.fn(),
			performNewSearch: jest.fn(),
			searchMore: jest.fn(),
			updateCurrentType: jest.fn()
		};
		store = new Vuex.Store( {
			state,
			getters,
			mutations,
			actions
		} );

	} );

	afterEach( () => {
		store = undefined;
		state = undefined;
		getters = undefined;
		actions = undefined;
		mutations = undefined;
	} );

	it( 'Renders search-user-notice component', () => {
		const wrapper = renderComponent( store );
		expect( wrapper.findComponent( UserNotice ).exists() ).toBe( true );
	} );

	it( 'Renders sd-autocomplete-search-input component', () => {

		const wrapper = renderComponent( store );
		expect( wrapper.findComponent( SdAutocompleteSearchInput ).exists() ).toBe( true );
	} );

	it( 'Renders sd-tabs component', () => {

		const wrapper = renderComponent( store );
		expect( wrapper.findComponent( SdTabs ).exists() ).toBe( true );
	} );

	it( 'Renders the correct number of sdTab components', () => {
		// This value comes from the mock of sdmsInitialSearchResults
		const wrapper = renderComponent( store );
		const expectedNumberOfTabs = 2;
		expect( wrapper.findAllComponents( SdTab ).length ).toBe( expectedNumberOfTabs );
	} );

	it( 'Renders search-filters component', () => {

		const wrapper = renderComponent( store );
		expect( wrapper.findComponent( SearchFilters ).exists() ).toBe( true );
	} );

	it( 'Renders did-you-mean component', () => {

		const wrapper = renderComponent( store );
		expect( wrapper.findComponent( DidYouMean ).exists() ).toBe( true );
	} );

	it( 'Renders search-results component', () => {

		const wrapper = renderComponent( store );
		expect( wrapper.findComponent( SearchResults ).exists() ).toBe( true );
	} );

	describe( 'Observer components', () => {
		it( 'is rendered if autoloadCounter and Result are available for the tab', () => {

			const wrapper = renderComponent( store );
			expect( wrapper.findAllComponents( Observer ).length ).toBe( 1 );
		} );

		it( 'is not rendered if autoloadCounter is 0', () => {
			store.state.autoloadCounter = {
				dummyTab1: 0
			};
			const wrapper = renderComponent( store );
			expect( wrapper.findAllComponents( Observer ).length ).toBe( 0 );
		} );

		it( 'is not rendered if results is empty', () => {
			store.state.results = {
				dummyTab1: []
			};
			const wrapper = renderComponent( store );
			expect( wrapper.findAllComponents( Observer ).length ).toBe( 0 );
		} );
	} );

	describe( 'on tab change', () => {
		it( 'update current type', () => {
			const wrapper = renderComponent( store );
			wrapper.vm.onTabChange( 'dummyTab2' );
			expect( actions.updateCurrentType ).toHaveBeenCalled();
			expect( actions.updateCurrentType ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'push changes to HistoryState', () => {
			const wrapper = renderComponent( store );
			wrapper.vm.onTabChange( 'dummyTab2' );
			expect( actions.pushQueryToHistoryState ).toHaveBeenCalled();
		} );

		describe( '$logs method', () => {

			it( 'to have been called', () => {
				const wrapper = renderComponent( store );

				// the method is first called on mounted
				expect( wrapper.vm.$log ).toHaveBeenCalled();
				expect( wrapper.vm.$log ).toHaveBeenCalledTimes( 1 );

				wrapper.vm.onTabChange( 'dummyTab2' );
				expect( wrapper.vm.$log ).toHaveBeenCalledTimes( 2 );

			} );

			it( 'to have been called with action "tab_change"', () => {
				const wrapper = renderComponent( store );
				wrapper.vm.onTabChange( 'dummyTab2' );
				expect( wrapper.vm.$log.mock.calls[ 1 ][ 0 ].action ).toBe( 'tab_change' );

			} );

			it( 'to have been called with the current searchterm', () => {
				const wrapper = renderComponent( store );
				wrapper.vm.onTabChange( 'dummyTab2' );
				expect( wrapper.vm.$log.mock.calls[ 1 ][ 0 ].search_query ).toBe( 'dummySearchTerm' );
			} );

			it( 'to have been called with the current type', () => {
				const wrapper = renderComponent( store );
				wrapper.vm.onTabChange( 'dummyTab2' );
				expect( wrapper.vm.$log.mock.calls[ 1 ][ 0 ].search_media_type ).toBe( 'dummyTab1' );
			} );
		} );
	} );

	describe( 'on filter change', () => {

		let hideDetailsMock = jest.fn();

		beforeEach( () => {
			const wrapper = renderComponent( store );
			wrapper.vm.$refs.dummyTab1[ 0 ].hideDetails = hideDetailsMock;
			wrapper.vm.onFilterChange( { mediaType: 'dummyTab1', filterType: 'dummyFilterType', value: 'dummyValue' } );
		} );

		it( 'hides the details of the changed tab', () => {
			expect( hideDetailsMock ).toHaveBeenCalled();
		} );

		it( 'update the query parameter', () => {
			const expectedMutationPayload = expect.objectContaining( {
				key: 'dummyFilterType',
				value: 'dummyValue'
			} );
			expect( mutations.updateOrDeleteQueryParam ).toHaveBeenCalled();
			// The first argument is the Context, so we access the second
			expect( mutations.updateOrDeleteQueryParam.mock.calls[ 0 ][ 1 ] ).toMatchObject( expectedMutationPayload );
		} );

		it( 'update history state', () => {
			expect( actions.pushQueryToHistoryState ).toHaveBeenCalled();
		} );
	} );

	describe( 'on update term', () => {
		const newTerm = 'newTerm';

		beforeEach( () => {
			const wrapper = renderComponent( store );
			wrapper.vm.onUpdateTerm( newTerm );
		} );

		it( 'update the searchTerm', () => {
			expect( mutations.setSearchTerm ).toHaveBeenCalled();
			// The first argument is the Context, so we access the second
			expect( mutations.setSearchTerm.mock.calls[ 0 ][ 1 ] ).toEqual( newTerm );
		} );

		it( 'update history state', () => {
			expect( actions.pushQueryToHistoryState ).toHaveBeenCalled();
		} );

	} );

	describe( 'on clear', () => {
		let wrapper;

		beforeEach( () => {
			wrapper = renderComponent( store );
			wrapper.vm.onClear();
		} );

		it( 'triggers a clean actions', () => {
			expect( actions.clear ).toHaveBeenCalled();
			// The first argument is the Context, so we access the second
			expect( actions.clear.mock.calls[ 0 ][ 1 ] ).toEqual( 'dummyTab1' );
		} );

		it( 'set pending to false', () => {
			expect( mutations.setPending ).toHaveBeenCalled();
			// The first argument is the Context, so we access the second
			expect( mutations.setPending.mock.calls[ 0 ][ 1 ] ).toEqual(
				expect.objectContaining( {
					type: 'dummyTab1',
					pending: false
				} )
			);
		} );

		it( 'set pending to false', () => {
			expect( mutations.setPending ).toHaveBeenCalled();
			// The first argument is the Context, so we access the second
			expect( mutations.setPending.mock.calls[ 0 ][ 1 ] ).toEqual(
				expect.objectContaining( {
					type: 'dummyTab1',
					pending: false
				} )
			);
		} );

		it( 'reset error state', () => {
			expect( mutations.setHasError ).toHaveBeenCalled();
			// The first argument is the Context, so we access the second
			expect( mutations.setHasError.mock.calls[ 0 ][ 1 ] ).toEqual( false );
		} );

		it( 'reset autoload for all mediatypes', () => {
			expect( mutations.resetAutoLoadForAllMediaType ).toHaveBeenCalled();
		} );

		it( 'triggers a log action of search_clear', () => {
			expect( wrapper.vm.$log ).toHaveBeenCalled();
			// the first call is triggered on mounted, so we look at the second call
			expect( wrapper.vm.$log.mock.calls[ 1 ][ 0 ].action ).toBe( 'search_clear' );
		} );
	} );

	describe( 'on getMoreResultsForTabIfAvailable', () => {
		it( 'triggers a search', () => {

			const wrapper = renderComponent( store );
			wrapper.vm.getMoreResultsForTabIfAvailable();

			expect( actions.searchMore ).toHaveBeenCalled();
		} );
	} );

	describe( 'on resetCountAndLoadMore', () => {
		it( 'triggers a search', () => {

			const wrapper = renderComponent( store );
			wrapper.vm.resetCountAndLoadMore();

			expect( actions.searchMore ).toHaveBeenCalled();
			expect( actions.searchMore.mock.calls[ 0 ][ 1 ] ).toEqual( true );
		} );

	} );

	describe( 'on onTermOrFilterChange', () => {
		let wrapper,
			dummyMediaType = 'dummyType';

		beforeEach( () => {
			wrapper = renderComponent( store );
			wrapper.vm.onTermOrFilterChange( dummyMediaType );
		} );

		it( 'reset results', () => {
			expect( mutations.resetResults ).toHaveBeenCalled();
			// The first argument is the Context, so we access the second
			expect( mutations.resetResults.mock.calls[ 0 ][ 1 ] ).toEqual( dummyMediaType );
		} );

		it( 'clears did you mean', () => {
			expect( mutations.clearDidYouMean ).toHaveBeenCalled();
		} );

		it( 'reset autoload for all media', () => {
			expect( mutations.resetAutoLoadForAllMediaType ).toHaveBeenCalled();
		} );

		it( 'triggers a new search', () => {
			expect( actions.performNewSearch ).toHaveBeenCalled();
		} );

	} );

	describe( 'watch', () => {
		describe( 'on currentType', () => {
			let wrapper;

			beforeEach( () => {
				wrapper = renderComponent( store );
				wrapper.vm.getMoreResultsForTabIfAvailable = jest.fn();
			} );

			it( 'triggers a new search if tab is set', ( done ) => {
				store.state.dummyCurrentType = 'changedType';

				Vue.nextTick().then( () => {
					expect( wrapper.vm.getMoreResultsForTabIfAvailable ).toHaveBeenCalled();
					done();
				} );
			} );

			it( 'perform no action if old and new type are the same', ( done ) => {
				store.state.dummyCurrentType = 'dummyTab1';

				Vue.nextTick().then( () => {
					expect( wrapper.vm.getMoreResultsForTabIfAvailable ).not.toHaveBeenCalled();
					done();
				} );
			} );

		} );
		describe( 'on currentSearchTerm', () => {
			let wrapper;

			beforeEach( () => {
				wrapper = renderComponent( store );
				wrapper.vm.onClear = jest.fn();
				wrapper.vm.onTermOrFilterChange = jest.fn();
			} );

			it( 'triggers an onClean if new term is empty', ( done ) => {
				store.state.dummySearchTerm = '';

				Vue.nextTick().then( () => {
					expect( wrapper.vm.onClear ).toHaveBeenCalled();
					expect( wrapper.vm.onTermOrFilterChange ).not.toHaveBeenCalled();
					done();
				} );
			} );

			it( 'perform no action if old and new term are the same', ( done ) => {
				store.state.dummySearchTerm = 'dummySearchTerm';

				Vue.nextTick().then( () => {
					expect( wrapper.vm.onClear ).not.toHaveBeenCalled();
					expect( wrapper.vm.onTermOrFilterChange ).not.toHaveBeenCalled();
					done();
				} );
			} );

			it( 'triggers onTermOrFilterChange if tyerm is different', ( done ) => {
				store.state.dummySearchTerm = 'newTerm';

				Vue.nextTick().then( () => {
					expect( wrapper.vm.onClear ).not.toHaveBeenCalled();
					expect( wrapper.vm.onTermOrFilterChange ).toHaveBeenCalled();
					done();
				} );
			} );

		} );
		describe( 'on allActiveFilters', () => {
			let wrapper;

			beforeEach( () => {
				wrapper = renderComponent( store );
				wrapper.vm.onTermOrFilterChange = jest.fn();
			} );

			it( 'perform no action if old and new term are the same', ( done ) => {
				store.state.dummyAllFilter = 'dummyAllFilter';

				Vue.nextTick().then( () => {
					expect( wrapper.vm.onTermOrFilterChange ).not.toHaveBeenCalled();
					done();
				} );
			} );

			it( 'perform no action if search term is null', ( done ) => {
				// We create an instance of the component with a null search term
				store.state.dummySearchTerm = '';
				wrapper = renderComponent( store );
				wrapper.vm.onTermOrFilterChange = jest.fn();

				store.state.dummyAllFilter = 'newFilter';

				Vue.nextTick().then( () => {
					expect( wrapper.vm.onTermOrFilterChange ).not.toHaveBeenCalled();
					done();
				} );
			} );

			it( 'triggers onTermOrFilterChange if filter is different and term is set', ( done ) => {

				store.state.dummyAllFilter = 'newFilter';

				Vue.nextTick().then( () => {
					expect( wrapper.vm.onTermOrFilterChange ).toHaveBeenCalled();
					expect( wrapper.vm.onTermOrFilterChange ).toHaveBeenCalledWith( 'dummyTab1' );
					done();
				} );
			} );

		} );
	} );
	describe( 'create', () => {
		it( 'triggers the syncActiveType', () => {
			renderComponent( store );
			expect( actions.syncActiveTypeAndQueryType ).toHaveBeenCalled();
		} );

		it( 'does not triggers a $log method if SearchTerm is not set', () => {

			getters.currentSearchTerm.mockReturnValueOnce( '' );

			const wrapper = renderComponent( store );
			expect( wrapper.vm.$log ).not.toHaveBeenCalled();
		} );

		it( 'does not triggers a $log method if SearchTerm is not set', () => {

			getters.currentType.mockReturnValueOnce( '' );

			const wrapper = renderComponent( store );
			expect( wrapper.vm.$log ).not.toHaveBeenCalled();
		} );

		it( 'triggers a $log method if SearchTerm and Type are set', () => {

			const wrapper = renderComponent( store );
			expect( wrapper.vm.$log ).toHaveBeenCalled();
			expect( wrapper.vm.$log ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'triggers a $log method with an action of "search_new" ', () => {

			const wrapper = renderComponent( store );
			expect( wrapper.vm.$log.mock.calls[ 0 ][ 0 ].action ).toBe( 'search_new' );
		} );

		it( 'triggers a $log method with an search_query of "currentSearchTerm" ', () => {

			const wrapper = renderComponent( store );
			expect( wrapper.vm.$log.mock.calls[ 0 ][ 0 ].search_query ).toBe( 'dummySearchTerm' );
		} );

		it( 'triggers a $log method with an search_media_type of "currentType', () => {
			const wrapper = renderComponent( store );
			expect( wrapper.vm.$log.mock.calls[ 0 ][ 0 ].search_media_type ).toBe( 'dummyTab1' );
		} );

		it( 'triggers a $log method with correct result count', () => {
			// this is set as part of the store mocking
			const expectedResultCount = 1;
			const wrapper = renderComponent( store );
			expect( wrapper.vm.$log.mock.calls[ 0 ][ 0 ].search_result_count ).toBe( expectedResultCount );
		} );
	} );
} );
