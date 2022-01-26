const Vuex = require( 'vuex' ),
	VueTestUtils = require( '@vue/test-utils' ),
	i18n = require( '../plugins/i18n.js' ),
	Component = require( '../../../resources/components/DidYouMean.vue' );

const localVue = VueTestUtils.createLocalVue();
localVue.use( Vuex );
localVue.use( i18n );

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
		const wrapper = VueTestUtils.shallowMount( Component, {
			store: store,
			localVue: localVue
		} );

		const element = wrapper.find( '.sdms-did-you-mean' );
		expect( element.exists() ).toBe( false );
	} );

	describe( 'When DidYouMean is present in the store', () => {
		it( 'Renders DidYouMean component', () => {
			store.replaceState( { didYouMean: 'test' } );
			const wrapper = VueTestUtils.shallowMount( Component, {
				store: store,
				localVue: localVue
			} );

			const element = wrapper.find( '.sdms-did-you-mean' );
			expect( element.exists() ).toBe( true );
		} );

		it( 'Creates an anchor tag', () => {
			store.replaceState( { didYouMean: 'test' } );
			const wrapper = VueTestUtils.mount( Component, {
				store: store,
				localVue: localVue
			} );

			expect( wrapper.vm.didYouMeanLink.tagName ).toBe( 'A' );
		} );
	} );

} );
