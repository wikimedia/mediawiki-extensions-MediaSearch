const { shallowMount, mount } = require( '@vue/test-utils' );
const when = require( 'jest-when' ).when;
const Component = require( '../../../resources/components/UserNotice.vue' );
const { CdxButton, CdxMessage } = require( '@wikimedia/codex' );

describe( 'UserNotice', () => {
	beforeEach( () => {
		when( global.mw.config.get )
			.calledWith( 'skin' )
			.mockReturnValue( 'fake' );
	} );

	describe( 'renders ', () => {
		it( 'the parent component', () => {
			const wrapper = shallowMount( Component );
			const element = wrapper.find( '.sdms-user-notice__message' );
			expect( element.exists() ).toBe( true );
		} );

		it( 'a button component', () => {
			const wrapper = mount( Component );
			const innerComponent = wrapper.findComponent( CdxButton );
			expect( innerComponent.exists() ).toBe( true );
		} );

		it( 'a message component', () => {
			const wrapper = shallowMount( Component );
			const innerComponent = wrapper.findComponent( CdxMessage );
			expect( innerComponent.exists() ).toBe( true );
		} );
	} );

	describe( 'does not render the component', () => {
		it( 'when user is on mobile skin', () => {
			when( global.mw.config.get )
				.calledWith( 'skin' )
				.mockReturnValueOnce( 'minerva' );
			const wrapper = shallowMount( Component );
			const element = wrapper.find( '.sdms-user-notice__message' );
			expect( element.exists() ).toBe( false );
		} );

		it( 'when user is unnamed (anonymous or a temporary user)', () => {
			global.mw.user.isNamed.mockReturnValueOnce( false );
			const wrapper = shallowMount( Component );
			const element = wrapper.find( '.sdms-user-notice__message' );
			expect( element.exists() ).toBe( false );
		} );

		it( 'when notice previously dismissed', () => {
			when( global.mw.user.options.get )
				.calledWith( 'sdms-search-user-notice-dismissed' )
				.mockReturnValueOnce( 1 );
			const wrapper = shallowMount( Component );
			const element = wrapper.find( '.sdms-user-notice__message' );
			expect( element.exists() ).toBe( false );
		} );

		it( 'when notice dismissed', ( done ) => {
			const wrapper = shallowMount( Component );
			wrapper.setData( { dismissed: true } );
			wrapper.vm.$nextTick( () => {
				const element = wrapper.find( '.sdms-user-notice__message' );
				expect( element.exists() ).toBe( false );
				done();
			} );
		} );
	} );

	describe( 'on dismiss button click', () => {
		it( 'sends saveOption to the api', () => {
			const wrapper = shallowMount( Component );
			wrapper.vm.dismiss();
			expect( global.mw.Api.prototype.saveOption ).toHaveBeenCalled();
			expect( global.mw.Api.prototype.saveOption )
				.toHaveBeenCalledWith( 'sdms-search-user-notice-dismissed', 1 );
		} );

		it( 'saves options to user object', () => {
			const wrapper = shallowMount( Component );
			wrapper.vm.dismiss();
			expect( global.mw.user.options.set ).toHaveBeenCalled();
			expect( global.mw.user.options.set )
				.toHaveBeenCalledWith( 'sdms-search-user-notice-dismissed', 1 );
		} );

		it( 'changes dismissed data', () => {
			const wrapper = shallowMount( Component );
			wrapper.vm.dismiss();
			expect( wrapper.vm.dismissed ).toBeTruthy();
		} );
	} );
} );
