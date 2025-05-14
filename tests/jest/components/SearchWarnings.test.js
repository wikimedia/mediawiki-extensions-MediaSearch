const Vuex = require( 'vuex' ),
	{ mount } = require( '@vue/test-utils' ),
	Component = require( '../../../resources/components/SearchWarnings.vue' );

describe( 'SearchWarnings', () => {
	let store,
		state,
		getters,
		actions,
		mutations;

	beforeEach( () => {
		state = {};
		getters = {};
		mutations = {};
		actions = {};
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

	describe( 'When warnings are present in the store', () => {
		it( 'Renders SearchWarnings component', () => {
			store.replaceState( { searchWarnings: 'bad thing' } );
			const wrapper = mount( Component, {
				global: {
					plugins: [ store ]
				}
			} );

			const element = wrapper.find( '.cdx-message--warning' );
			expect( element.exists() ).toBe( true );
		} );
	} );

} );
