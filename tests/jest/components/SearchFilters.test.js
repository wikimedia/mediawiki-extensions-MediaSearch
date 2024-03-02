const Vuex = require( 'vuex' ),
	{ mount } = require( '@vue/test-utils' ),
	Component = require( '../../../resources/components/SearchFilters.vue' ),
	NamespaceFilterDialogComponent = require( '../../../resources/components/NamespaceFilterDialog.vue' );

const defaultMediaType = 'image';
const initialState = {
	totalHits: {
		image: 0,
		audio: 0,
		video: 0,
		page: 0,
		other: 0
	},
	filterValues: {
		image: {},
		audio: {},
		video: {},
		page: {},
		other: {}
	}
};
const renderComponent = ( store, mediaType ) => {
	return mount( Component, {
		props: {
			mediaType: mediaType || defaultMediaType
		},
		global: {
			plugins: [ store ],
			mocks: {
				$log: jest.fn()
			}
		}
	} );
};

describe( 'SearchFilters', () => {
	let store,
		state,
		mutations;

	beforeEach( () => {
		state = JSON.parse( JSON.stringify( initialState ) );
		mutations = {
			addFilterValue: jest.fn(),
			removeFilterValue: jest.fn()
		};
		store = new Vuex.Store( {
			state,
			mutations
		} );

	} );

	it( 'renders successfully', () => {

		const wrapper = renderComponent( store );

		expect( wrapper.html().length ).toBeGreaterThan( 0 );

	} );

	it( 'renders NamespaceFilterDialog successfully if mediatype is "page"', () => {

		const wrapper = renderComponent( store, 'page' );

		const element = wrapper.findComponent( NamespaceFilterDialogComponent );

		expect( element.exists() ).toBe( true );

	} );

	describe( 'Methods', () => {

		describe( 'onSelect', () => {

			it( 'if value is passed and is not empty, addFilterValue', () => {
				const wrapper = renderComponent( store );
				const addFilterValueMock = jest.fn();
				wrapper.vm.addFilterValue = addFilterValueMock;

				wrapper.vm.onSelect( 'gif', 'filemime' );

				expect( addFilterValueMock ).toHaveBeenCalled();

			} );

			it( 'if value is not passed or is empty, removeFilterValue and reset value', () => {
				const wrapper = renderComponent( store );
				const removeFilterValueMock = jest.fn();
				wrapper.vm.removeFilterValue = removeFilterValueMock;

				const resetSelectValueMock = jest.fn();
				wrapper.vm.getRef = function () {
					return { reset: resetSelectValueMock };
				};

				wrapper.vm.onSelect( '', 'filemime' );

				expect( removeFilterValueMock ).toHaveBeenCalled();
				expect( resetSelectValueMock ).toHaveBeenCalled();

			} );

			it( 'emits "filter-change"', () => {

				const wrapper = renderComponent( store );

				wrapper.vm.onSelect( 'gif', 'filemime' );

				expect( wrapper.emitted()[ 'filter-change' ] ).toHaveLength( 1 );

			} );

		} );

		describe( 'getFilterPrefix', () => {

			it( 'if filterType is passed as sort', () => {

				const wrapper = renderComponent( store );

				const data = wrapper.vm.getFilterPrefix( 'sort' );

				expect( data ).not.toBe( '' );

			} );

			it( 'if filterType is not passed as sort', () => {

				const wrapper = renderComponent( store );

				const data = wrapper.vm.getFilterPrefix( 'filemime' );

				expect( data ).toBe( '' );

			} );

		} );

		describe( 'resetAllFilters', () => {

			it( 'reset all search filters', () => {
				const wrapper = renderComponent( store );
				const resetSelectValueMock = jest.fn();
				wrapper.vm.getRef = function () {
					return { reset: resetSelectValueMock };
				};

				wrapper.vm.resetAllFilters();

				expect( resetSelectValueMock ).toHaveBeenCalledTimes( wrapper.vm.searchFilters.length );

			} );

		} );

		describe( 'synchronizeFilters', () => {

			it( 'reset all search filters, if no value in store', () => {

				const wrapper = renderComponent( store );

				store.state.filterValues = {
					image: {
						haslicense: null,
						filemime: null,
						fileres: null,
						assessment: null,
						sort: null
					},
					audio: null,
					video: null,
					page: null,
					other: null
				};
				const resetSelectValueMock = jest.fn();
				wrapper.vm.getRef = function () {
					return { reset: resetSelectValueMock };
				};

				wrapper.vm.synchronizeFilters();

				expect( resetSelectValueMock ).toHaveBeenCalledTimes( 5 );

			} );

			it( 'set filter values with values in store if valid', () => {

				const wrapper = renderComponent( store );

				store.state.filterValues = {
					image: {
						haslicense: {
							label: 'No restrictions',
							value: 'unrestricted'
						},
						filemime: {
							label: 'jpg',
							value: 'jpeg'
						},
						fileres: {
							label: 'Small',
							value: '<500'
						},
						assessment: {
							label: 'Featured picture',
							value: 'featured-image'
						},
						sort: {
							label: 'Recency',
							value: 'recency'
						}
					},
					audio: null,
					video: null,
					page: null,
					other: null
				};

				const setSelectValueMock = jest.fn();
				wrapper.vm.getRef = function () {
					return { select: setSelectValueMock };
				};

				wrapper.vm.synchronizeFilters();

				expect( setSelectValueMock ).toHaveBeenCalledTimes( 5 );

			} );

			it( 'remove filter values from store if not valid and emit "filter-change"', () => {

				const wrapper = renderComponent( store );

				store.state.filterValues = {
					image: {
						haslicense: {
							label: 'No restrictions-test',
							value: 'unrestricted-test'
						},
						filemime: {
							label: 'jpg-test',
							value: 'jpeg-test'
						},
						fileres: {
							label: 'Small-test',
							value: '<500-test'
						},
						assessment: {
							label: 'Featured picture-test',
							value: 'featured-image-test'
						},
						sort: {
							label: 'Recency-test',
							value: 'recency-test'
						}
					},
					audio: null,
					video: null,
					page: null,
					other: null
				};

				const removeFilterValueMock = jest.fn();
				wrapper.vm.removeFilterValue = removeFilterValueMock;

				wrapper.vm.synchronizeFilters();

				expect( removeFilterValueMock ).toHaveBeenCalledTimes( 5 );

				expect( wrapper.emitted()[ 'filter-change' ] ).toHaveLength( 5 );

			} );

		} );

	} );

} );
