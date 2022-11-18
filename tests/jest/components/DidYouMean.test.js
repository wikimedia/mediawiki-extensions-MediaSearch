const Vuex = require( 'vuex' ),
	{ mount, shallowMount } = require( '@vue/test-utils' ),
	Component = require( '../../../resources/components/DidYouMean.vue' );

describe( 'DidYoumean', () => {
	let store,
		state,
		getters,
		actions,
		mutations;

	beforeEach( () => {
		state = {};
		getters = {
		};
		mutations = {
		};
		actions = {
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

	it( 'Does not render DidYouMean component if state if empty', () => {
		const wrapper = shallowMount( Component, {
			global: {
				plugins: [ store ]
			}
		} );

		const element = wrapper.find( '.sdms-did-you-mean' );
		expect( element.exists() ).toBe( false );
	} );

	describe( 'When DidYouMean is present in the store', () => {
		it( 'Renders DidYouMean component', () => {
			store.replaceState( { didYouMean: 'test' } );
			const wrapper = mount( Component, {
				global: {
					plugins: [ store ]
				}
			} );

			const element = wrapper.find( '.sdms-did-you-mean' );
			expect( element.exists() ).toBe( true );
		} );

		it( 'Creates an anchor tag', () => {
			store.replaceState( { didYouMean: 'test' } );
			const wrapper = mount( Component, {
				global: {
					plugins: [ store ]
				}
			} );
			expect( wrapper.vm.didYouMeanLink.tagName ).toBe( 'A' );
		} );
	} );

} );
