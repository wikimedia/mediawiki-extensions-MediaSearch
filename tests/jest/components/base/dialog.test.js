const Vue = require( 'vue' );
const VueTestUtils = require( '@vue/test-utils' );
const Dialog = require( '../../../../resources/components/base/Dialog.vue' );

describe( 'Dialog Component', () => {
	it( 'Renders successfully', () => {
		const wrapper = VueTestUtils.shallowMount( Dialog, {
			propsData: {
				active: false
			}
		} );

		const element = wrapper.find( '.sd-dialog-wrapper' );
		expect( element.exists() ).toBe( true );
	} );

	it( 'dialog container is not rendered', () => {
		const wrapper = VueTestUtils.shallowMount( Dialog, {
			propsData: {
				active: false
			}
		} );

		const element = wrapper.find( '.sd-dialog' );
		expect( element.exists() ).toBe( false );
	} );

	it( 'dialog container is rendered', () => {
		const wrapper = VueTestUtils.shallowMount( Dialog, {
			propsData: {
				active: true
			}
		} );

		const element = wrapper.find( '.sd-dialog' );
		expect( element.exists() ).toBe( true );
	} );

	it( 'triggers close on keydown escape', ( done ) => {
		const wrapper = VueTestUtils.shallowMount( Dialog, {
			propsData: {
				active: true
			}
		} );

		const element = wrapper.find( '.sd-dialog' );
		element.trigger( 'keyup.esc' );

		Vue.nextTick().then( () => {
			expect( wrapper.emitted().close ).toHaveLength( 1 );
			done();
		} );
	} );

	it( 'triggers "key" event to be fired when keyboard is clicked', ( done ) => {
		const wrapper = VueTestUtils.shallowMount( Dialog, {
			propsData: {
				active: true
			}
		} );

		const element = wrapper.find( '.sd-dialog' );
		element.trigger( 'keyup.enter' );

		Vue.nextTick().then( () => {
			expect( wrapper.emitted().key[ 0 ][ 0 ] ).toBe( '13' );
			done();
		} );
	} );

	it( 'destroys and removes all added class from document body', ( done ) => {
		document.body.classList.remove = jest.fn();
		document.body.removeChild = jest.fn();
		const wrapper = VueTestUtils.shallowMount( Dialog, {
			propsData: {
				active: true
			}
		} );

		wrapper.destroy();

		Vue.nextTick().then( () => {
			expect( document.body.classList.remove ).toHaveBeenCalled();
			expect( document.body.removeChild ).toHaveBeenCalled();
			done();
		} );
	} );

	it( 'is headless if headless is passed as true', () => {
		const wrapper = VueTestUtils.mount( Dialog, {
			propsData: {
				active: true,
				headless: true
			}
		} );

		expect( wrapper.find( '.sd-dialog__header' ).exists() ).toBeFalsy();
	} );

	it( 'closes if active is changed to false', () => {
		document.body.classList.remove = jest.fn();
		const wrapper = VueTestUtils.mount( Dialog, {
			propsData: {
				active: true
			}
		} );

		wrapper.setProps( {
			active: false
		} );

		Vue.nextTick().then( () => {
			expect( document.body.classList.remove ).toHaveBeenCalled();
			expect( wrapper.find( '.sd-dialog' ).exists() ).toBeFalsy();
		} );
	} );

	it( 'focus if active is changed to true', () => {
		document.body.classList.add = jest.fn();
		const wrapper = VueTestUtils.mount( Dialog, {
			propsData: {
				active: false
			}
		} );

		wrapper.setProps( {
			active: true
		} );

		Vue.nextTick().then( () => {
			expect( document.body.classList.add ).toHaveBeenCalled();
			expect( wrapper.find( '.sd-dialog' ).exists() ).toBeTruthy();
		} );
	} );

	it( 'causes a "progress" event to be fired when the progress button is clicked', ( done ) => {
		mw.config.get.mockReturnValue( 'minerva' );

		const wrapper = VueTestUtils.mount( Dialog, {
			propsData: {
				active: true,
				progressiveAction: 'Next'
			}
		} );

		const progressButton = wrapper.find(
			'.sd-dialog__header-action--progressive'
		);
		progressButton.trigger( 'click' );

		Vue.nextTick().then( () => {
			expect( wrapper.emitted().progress ).toHaveLength( 1 );
			done();
		} );
	} );

	it( 'causes a "close" event to be fired when the close button is clicked', ( done ) => {
		const wrapper = VueTestUtils.mount( Dialog, {
			propsData: {
				active: true
			}
		} );

		const closeButton = wrapper.find( '.sd-dialog__header-action--safe' );
		closeButton.trigger( 'click' );

		Vue.nextTick().then( () => {
			expect( wrapper.emitted().close ).toHaveLength( 1 );
			done();
		} );
	} );
} );
