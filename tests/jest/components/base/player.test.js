const VueTestUtils = require( '@vue/test-utils' ),
	Player = require( '../../../../resources/components/base/Player.vue' );

describe( 'Player Component', () => {

	beforeEach( () => {
		window.videojs = jest.fn().mockReturnValue( {
			on: jest.fn()
		} );

		mw.loader.using.mockReturnValue( {
			then: function ( paramsFunc ) {
				paramsFunc();
				return {
					then: function ( paramsThenFunc ) {
						paramsThenFunc();
						return {
							then: jest.fn()
						};
					}
				};
			}
		} );
	} );

	it( 'renders successfully', () => {

		const wrapper = VueTestUtils.shallowMount( Player, {
			propsData: {}
		} );

		const element = wrapper.find( '.sd-player' );

		expect( element.exists() ).toBe( true );

	} );

	it( 'renders src as "fallbackUrl"', () => {

		const fallbackUrl = 'testurl';
		const wrapper = VueTestUtils.shallowMount( Player, {
			propsData: {
				fallbackUrl
			}
		} );

		const element = wrapper.find( '.sd-player' );
		expect( element.attributes().src ).toBe( fallbackUrl );

	} );

	it( 'renders poster as "options.poster"', () => {

		const options = {
			poster: 'Cat Video'
		};
		const wrapper = VueTestUtils.shallowMount( Player, {
			propsData: {
				options
			}
		} );

		const element = wrapper.find( '.sd-player' );
		expect( element.attributes().poster ).toBe( options.poster );

	} );

	it( 'emits "play" event when onPlay is called ', () => {

		const wrapper = VueTestUtils.shallowMount( Player, {
			propsData: { }
		} );

		wrapper.vm.onPlay();

		expect( wrapper.emitted().play[ 0 ][ 0 ] ).toBeUndefined();

	} );

	it( 'calls player dispose method when component is destroyed', () => {

		const mockPlayerDispose = jest.fn();
		const wrapper = VueTestUtils.shallowMount( Player, {
			propsData: { }
		} );

		wrapper.vm.player.dispose = mockPlayerDispose;

		wrapper.unmount();

		expect( mockPlayerDispose ).toHaveBeenCalled();
	} );

} );
