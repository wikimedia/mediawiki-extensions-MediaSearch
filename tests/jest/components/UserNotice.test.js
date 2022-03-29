const VueTestUtils = require( '@vue/test-utils' ),
	i18n = require( '../plugins/i18n.js' ),
	when = require( 'jest-when' ).when,
	Component = require( '../../../resources/components/UserNotice.vue' ),
	Button = require( '../../../resources/components/base/Button.vue' ),
	Message = require( '../../../resources/components/base/Message.vue' );

describe( 'UserNotice', () => {
	beforeEach( () => {
		when( global.mw.config.get )
			.calledWith( 'skin' )
			.mockReturnValue( 'fake' );
	} );
	describe( 'renders ', () => {
		it( 'the parent component', () => {
			const wrapper = VueTestUtils.shallowMount( Component, {
				global: {
					plugins: [ i18n ]
				}
			} );

			const element = wrapper.find( '.sdms-user-notice__message' );

			expect( element.exists() ).toBe( true );
		} );
		it( 'a button component', () => {
			const wrapper = VueTestUtils.mount( Component, {
				global: {
					plugins: [ i18n ]
				}
			} );

			const innerComponent = wrapper.findComponent( Button );
			expect( innerComponent.exists() ).toBe( true );
		} );
		it( 'a message component', () => {
			const wrapper = VueTestUtils.shallowMount( Component, {
				global: {
					plugins: [ i18n ]
				}
			} );

			const innerComponent = wrapper.findComponent( Message );
			expect( innerComponent.exists() ).toBe( true );
		} );
	} );
	describe( 'does not render the component', () => {
		it( 'when user is on mobile skin', () => {
			when( global.mw.config.get )
				.calledWith( 'skin' )
				.mockReturnValueOnce( 'minerva' );

			const wrapper = VueTestUtils.shallowMount( Component, {
				global: {
					plugins: [ i18n ]
				}
			} );

			const element = wrapper.find( '.sdms-user-notice__message' );
			expect( element.exists() ).toBe( false );
		} );
		it( 'when user is Anon', () => {
			global.mw.user.isAnon.mockReturnValueOnce( true );

			const wrapper = VueTestUtils.shallowMount( Component, {
				global: {
					plugins: [ i18n ]
				}
			} );

			const element = wrapper.find( '.sdms-user-notice__message' );
			expect( element.exists() ).toBe( false );
		} );
		it( 'when notice previously dismissed', () => {
			when( global.mw.user.options.get )
				.calledWith( 'sdms-search-user-notice-dismissed' )
				.mockReturnValueOnce( 1 );

			const wrapper = VueTestUtils.shallowMount( Component, {
				global: {
					plugins: [ i18n ]
				}
			} );

			const element = wrapper.find( '.sdms-user-notice__message' );
			expect( element.exists() ).toBe( false );
		} );
		it( 'when notice dismissed', ( done ) => {

			const wrapper = VueTestUtils.shallowMount( Component, {
				global: {
					plugins: [ i18n ]
				}
			} );

			wrapper.setData( { dismissed: true } );

			wrapper.vm.$nextTick( () => {
				const element = wrapper.find( '.sdms-user-notice__message' );
				expect( element.exists() ).toBe( false );
				done();
			} );
		} );
	} );
	describe( 'on dismiss button click', () => {
		it( 'send saveOption to the api', () => {
			const wrapper = VueTestUtils.shallowMount( Component, {
				global: {
					plugins: [ i18n ]
				}
			} );

			wrapper.vm.dismiss();
			expect( global.mw.Api.prototype.saveOption ).toHaveBeenCalled();
			expect( global.mw.Api.prototype.saveOption ).toHaveBeenCalledWith( 'sdms-search-user-notice-dismissed', 1 );
		} );
		it( 'save options to user object', () => {
			const wrapper = VueTestUtils.shallowMount( Component, {
				global: {
					plugins: [ i18n ]
				}
			} );

			wrapper.vm.dismiss();
			expect( global.mw.user.options.set ).toHaveBeenCalled();
			expect( global.mw.user.options.set ).toHaveBeenCalledWith( 'sdms-search-user-notice-dismissed', 1 );
		} );
		it( 'change dismissed data', () => {
			const wrapper = VueTestUtils.shallowMount( Component, {
				global: {
					plugins: [ i18n ]
				}
			} );

			wrapper.vm.dismiss();
			expect( wrapper.vm.dismissed ).toBeTruthy();
		} );
	} );
} );
