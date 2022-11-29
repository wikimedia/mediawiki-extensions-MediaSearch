const Vuex = require( 'vuex' ),
	{ shallowMount } = require( '@vue/test-utils' ),
	Component = require( '../../../resources/components/SearchResults.vue' ),
	SearchErrorComponent = require( '../../../resources/components/SearchError.vue' ),
	NoResultsComponent = require( '../../../resources/components/NoResults.vue' ),
	EndOfResultsComponent = require( '../../../resources/components/EndOfResults.vue' ),
	EmptyStateComponent = require( '../../../resources/components/EmptyState.vue' ),
	ImageComponent = require( '../../../resources/components/results/ImageResult.vue' );
require( '../mocks/EventListener.js' );

const initialState = {
	continue: {
		image: undefined,
		audio: undefined,
		video: undefined,
		page: undefined,
		other: undefined
	},
	details: {
		image: null,
		audio: null,
		video: null,
		page: null,
		other: null
	},
	hasError: false,
	initialized: false,
	pending: {
		image: false,
		audio: false,
		video: false,
		page: false,
		other: false
	},
	results: {
		image: [ {
			title: 'DummyTitle',
			canonicalurl: 'DummyUrl',
			index: 0
		}, {
			title: 'DummyTitle2',
			canonicalurl: 'DummyUrl2',
			index: 1
		} ],
		audio: [],
		video: [],
		page: [],
		other: []
	},
	dummySearchTerm: 'dummyText'
};
const defaultMediaType = 'image';
const mockFocus = jest.fn();
const renderComponent = ( store, mediaType ) => {
	return shallowMount( Component, {
		props: {
			mediaType: mediaType || defaultMediaType
		},
		global: {
			plugins: [ store ],
			mocks: {
				$log: jest.fn(),
				focus: mockFocus
			}
		}
	} );
};

describe( 'SearchResults', () => {
	let store,
		state,
		getters,
		actions,
		mutations;
	const fetchDetailsMock = jest.fn().mockReturnValue( {
		then: function ( params ) {
			return params( {
				query: {
					pages: {
						image: initialState.results.image[ 0 ]
					}
				}
			} );
		}
	} );

	beforeEach( () => {
		jest.resetModules();
		state = JSON.parse( JSON.stringify( initialState ) );
		getters = {
			allActiveDetails: function ( localState ) {
				return localState.details;
			},
			currentSearchTerm: function ( localState ) {
				return localState.dummySearchTerm;
			}
		};
		mutations = {
			setDetails: jest.fn(),
			clearDetails: jest.fn()
		};
		actions = {
			fetchDetails: fetchDetailsMock
		};
		store = Vuex.createStore( {
			state() {
				return state;
			},
			getters,
			mutations,
			actions
		} );
		jest.clearAllMocks();
	} );

	afterEach( () => {
		store = undefined;
		state = undefined;
		getters = undefined;
		actions = undefined;
		mutations = undefined;
	} );

	describe( 'renders child component', () => {

		it( '(based on mediatype) successfully', () => {

			const wrapper = renderComponent( store );
			const element = wrapper.findComponent( ImageComponent );

			expect( element.exists() ).toBe( true );

		} );

		it( 'spinner if pending (based on mediatype) is true', () => {

			store.state.pending = {
				image: true
			};

			const wrapper = renderComponent( store );

			const element = wrapper.find( '.sdms-search-results__pending' );
			expect( element.exists() ).toBe( true );

		} );

		it( 'show more button if continue (based on mediatype) is truthy and pending is false', () => {

			store.state.continue = {
				image: true
			};

			const wrapper = renderComponent( store );

			const element = wrapper.find( '.sdms-load-more' );
			expect( element.exists() ).toBe( true );

		} );

		it( 'SearchError if hasError is true', () => {

			store.state.hasError = true;

			const wrapper = renderComponent( store );

			const element = wrapper.findComponent( SearchErrorComponent );
			expect( element.exists() ).toBe( true );

		} );

		describe( 'when hasError is false', () => {

			it( 'and hasNoResults is true, render NoResults Component', () => {

				store.state.results = {
					image: []
				};
				// The api request will set the continue object to NULL (instead than undefined)
				state.continue.image = null;

				const wrapper = renderComponent( store );

				const element = wrapper.findComponent( NoResultsComponent );
				expect( element.exists() ).toBe( true );

			} );

			it( 'and hasNoResults is false, and endOfResults is true render EndOfResults Component', () => {
				// The api request will set the continue object to NULL (instead than undefined)
				store.state.continue.image = null;
				const wrapper = renderComponent( store, defaultMediaType );

				const element = wrapper.findComponent( EndOfResultsComponent );
				expect( element.exists() ).toBe( true );

			} );

			it( 'and hasNoResults is false, endOfResults is false and shouldShowEmptyState is true render EmptyState Component', () => {

				store.state.results = {
					image: []
				};
				store.state.dummySearchTerm = '';
				const wrapper = renderComponent( store, defaultMediaType );

				const element = wrapper.findComponent( EmptyStateComponent );

				expect( element.exists() ).toBe( true );

			} );

		} );

	} );

	describe( 'quickview', () => {

		it( 'renders Dialog Component if isMobileSkin is true', () => {

			mw.config.get.mockReturnValueOnce( 'minerva' );
			const wrapper = renderComponent( store );

			const element = wrapper.find( '.sdms-search-results__details-dialog' );
			expect( element.exists() ).toBe( true );

		} );

		it( 'renders side component if isMobileSkin is false', () => {

			const wrapper = renderComponent( store );

			const element = wrapper.find( '.sdms-search-results__details' );
			expect( element.exists() ).toBe( true );

		} );
	} );

	describe( 'Computed', () => {

		describe( 'resultComponent', () => {

			it( 'when media type is image', () => {

				const wrapper = renderComponent( store );

				expect( wrapper.vm.resultComponent ).toBe( 'image-result' );

			} );

			it( 'when media type is not image', () => {

				const wrapper = shallowMount( Component, {
					props: {
						mediaType: 'video'
					},
					global: {
						plugins: [ store ],
						mocks: {
							$log: jest.fn()
						}
					}
				} );

				expect( wrapper.vm.resultComponent ).toBe( 'video-result' );

			} );
		} );

	} );

	describe( 'Methods', () => {

		describe( 'showDetails', () => {
			const dummyscrollIntoViewIfNeeded = jest.fn();
			const dummyScrollIntoView = jest.fn();
			let wrapper;

			beforeEach( () => {
				store.state.details.image = {
					title: 'DummyTitle',
					canonicalurl: 'DummyUrl',
					index: 0
				};
				wrapper = renderComponent( store );
				wrapper.vm.$refs.aside.scrollIntoView = dummyScrollIntoView;
				wrapper.vm.scrollIntoViewIfNeeded = dummyscrollIntoViewIfNeeded;

				// Call showDetails
				wrapper.vm.showDetails( state.results[ defaultMediaType ][ 0 ].title, 0 );

			} );

			it( 'scroll to view', ( done ) => {

				wrapper.vm.$nextTick().then( () => {
					expect( dummyscrollIntoViewIfNeeded ).toHaveBeenCalled();
					expect( dummyScrollIntoView ).toHaveBeenCalled();
					done();
				} );
			} );

			it( 'clear details if timeout isnt cleared', () => {
				jest.useFakeTimers();
				// Call showDetails
				wrapper.vm.showDetails( state.results[ defaultMediaType ][ 0 ].title, 0 );

				jest.runAllTimers();

				expect( mutations.clearDetails ).toHaveBeenCalled();
				expect( fetchDetailsMock ).toHaveBeenCalled();

			} );

			it( 'setDetails', () => {

				expect( fetchDetailsMock ).toHaveBeenCalled();
				expect( mutations.setDetails ).toHaveBeenCalled();

			} );

		} );

		describe( 'hideDetails', () => {

			it( 'return if not mediatype details', () => {
				const wrapper = renderComponent( store );
				wrapper.vm.hideDetails( false );

				expect( mutations.clearDetails ).not.toHaveBeenCalled();
			} );

			it( 'if restoreFocus is passed as true, focus on current title', () => {

				store.state.details = {
					[ defaultMediaType ]: state.results[ defaultMediaType ][ 0 ]
				};

				const dummyscrollIntoViewIfNeeded = jest.fn();
				const wrapper = renderComponent( store );
				wrapper.vm.scrollIntoViewIfNeeded = dummyscrollIntoViewIfNeeded;

				wrapper.vm.hideDetails( true );

				expect( mockFocus ).toHaveBeenCalled();
			} );

			it( 'if restoreFocus is passed as false, focus on current title', () => {

				store.state.details = {
					[ defaultMediaType ]: state.results[ defaultMediaType ][ 0 ]
				};

				const wrapper = renderComponent( store );

				const dummyscrollIntoViewIfNeeded = jest.fn();
				wrapper.vm.scrollIntoViewIfNeeded = dummyscrollIntoViewIfNeeded;

				wrapper.vm.hideDetails( false );

				expect( mockFocus ).not.toHaveBeenCalled();
				expect( mutations.clearDetails ).toHaveBeenCalled();
			} );

		} );

		describe( 'changeQuickViewResult', () => {

			it( 'set focusOn to next, when shouldfocuschange is true and addend is 1', () => {

				store.state.details = {
					[ defaultMediaType ]: state.results[ defaultMediaType ][ 0 ]
				};

				const wrapper = renderComponent( store );

				const dummyShowDetails = jest.fn();
				wrapper.vm.showDetails = dummyShowDetails;

				wrapper.vm.changeQuickViewResult( true, 1 );

				expect( dummyShowDetails ).toHaveBeenCalled();
				expect( wrapper.vm.focusOn ).toBe( 'next' );
			} );

			it( 'set focusOn to previous, when shouldfocuschange is true and addend is not 1', () => {

				store.state.details = {
					[ defaultMediaType ]: state.results[ defaultMediaType ][ 0 ]
				};

				const wrapper = renderComponent( store );

				const dummyShowDetails = jest.fn();
				wrapper.vm.showDetails = dummyShowDetails;

				wrapper.vm.changeQuickViewResult( true, -1 );

				expect( dummyShowDetails ).not.toHaveBeenCalled();
				expect( wrapper.vm.focusOn ).toBe( 'previous' );
			} );

			it( 'set focusOn to null, when shouldfocuschange is false', () => {

				store.state.details = {
					[ defaultMediaType ]: state.results[ defaultMediaType ][ 0 ]
				};

				const wrapper = renderComponent( store );

				const dummyShowDetails = jest.fn();
				wrapper.vm.showDetails = dummyShowDetails;

				wrapper.vm.changeQuickViewResult( false, 1 );

				expect( dummyShowDetails ).toHaveBeenCalled();
				expect( wrapper.vm.focusOn ).toBe( null );
			} );

		} );

		describe( 'scrollIntoViewIfNeeded', () => {
			test.todo( 'returns if no ref' );
			test.todo( 'if bounds top or bounds bottom is < 0, scrolls into view' );
			test.todo( 'if bounds top or bounds bottom is > window height, scrolls into view' );
		} );

		describe( 'onDialogKeyup', () => {

			it( 'if code is ArrowRight, pass adddend as 1', () => {
				const wrapper = renderComponent( store );
				const changeQuickViewResultMock = jest.fn();
				wrapper.vm.changeQuickViewResult = changeQuickViewResultMock;

				wrapper.vm.onDialogKeyup( 'ArrowRight' );

				expect( changeQuickViewResultMock ).toHaveBeenCalled();
			} );

			it( 'if code is ArrowLeft, pass adddend as -1', () => {
				const changeQuickViewResultMock = jest.fn();
				const wrapper = renderComponent( store );

				wrapper.vm.changeQuickViewResult = changeQuickViewResultMock;

				wrapper.vm.onDialogKeyup( 'ArrowLeft' );

				expect( changeQuickViewResultMock ).toHaveBeenCalledWith( true, -1 );

			} );

		} );

		describe( 'getResultStyle', () => {

			it( 'if initialized is false, resultStyle is false', () => {

				const wrapper = renderComponent( store );

				wrapper.vm.getResultStyle();

				expect( wrapper.vm.resultStyle ).toBeFalsy();

			} );

			it( 'if mediaType is not video, resultStyle is false', () => {

				const wrapper = renderComponent( store );

				wrapper.vm.getResultStyle();

				expect( wrapper.vm.resultStyle ).toBeFalsy();

			} );

			it( 'if mediaType is video, initialized is true, and offsetWidth is zero, resultStyle is false', () => {

				store.state.initialized = true;
				store.state.details = {
					[ defaultMediaType ]: state.results[ defaultMediaType ][ 0 ]
				};

				const wrapper = renderComponent( store, 'video' );

				wrapper.vm.getResultStyle();

				expect( wrapper.vm.resultStyle ).toBeFalsy();

			} );

		} );

		describe( 'getDebouncedResultStyle', () => {

			it( 'calls getResultStyleMock', () => {
				jest.useFakeTimers();
				const wrapper = renderComponent( store );

				const getResultStyleMock = jest.fn();
				wrapper.vm.getResultStyle = getResultStyleMock;

				wrapper.vm.getDebouncedResultStyle();

				jest.runAllTimers();
				expect( getResultStyleMock ).toHaveBeenCalled();
			} );

		} );

	} );

	describe( 'watch', () => {

		describe( 'on currentSearchTerm', () => {

			it( 'set showQuickView to false and cleardetails', ( done ) => {
				const wrapper = renderComponent( store );
				store.state.dummySearchTerm = 'dummySearchTermChanged';

				wrapper.vm.$nextTick().then( () => {
					expect( wrapper.vm.showQuickView ).toBe( false );
					expect( mutations.clearDetails ).toHaveBeenCalled();
					done();
				} );
			} );

		} );

		describe( 'on initialized', () => {
			it( 'trigger getResultStyle', ( done ) => {
				const wrapper = renderComponent( store );
				store.state.initialized = true;

				const dummyGetResultStyleMock = jest.fn();
				wrapper.vm.getResultStyle = dummyGetResultStyleMock;

				wrapper.vm.$nextTick().then( () => {
					expect( dummyGetResultStyleMock ).toHaveBeenCalled();
					done();
				} );
			} );

		} );

		describe( 'on allActiveDetails', () => {

			it( 'set showQuickView to true if details has mediatype and showQuickView is false', ( done ) => {
				const wrapper = renderComponent( store );
				store.state.details = JSON.stringify( {
					image: store.state.results.image[ 0 ],
					audio: null,
					video: null,
					page: null,
					other: null
				} );
				const dummyGetResultStyleMock = jest.fn();
				wrapper.vm.getResultStyle.bind = dummyGetResultStyleMock;

				wrapper.vm.$nextTick().then( () => {
					expect( dummyGetResultStyleMock ).toHaveBeenCalled();
					expect( wrapper.vm.showQuickView ).toBe( true );
					done();
				} );
			} );

		} );

	} );

	describe( 'on created', () => {

		it( 'add resize event listener', () => {
			renderComponent( store );

			expect( window.addEventListener ).toHaveBeenCalled();
			expect( window.addEventListener.mock.calls[ 0 ][ 0 ] ).toBe( 'resize' );
		} );

	} );

	describe( 'on destroyed', () => {

		it( 'remove resize event listener', () => {
			const wrapper = renderComponent( store );
			wrapper.unmount();

			expect( window.removeEventListener ).toHaveBeenCalled();
			expect( window.removeEventListener.mock.calls[ 0 ][ 0 ] ).toBe( 'resize' );
		} );

	} );

} );
