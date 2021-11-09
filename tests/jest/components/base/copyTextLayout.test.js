const VueTestUtils = require( '@vue/test-utils' );
const Vue = require( 'vue' );
const i18n = require( '../../plugins/i18n.js' );
const CopyTextLayout = require( '../../../../resources/components/base/CopyTextLayout.vue' );
require( '../../mocks/ExecCommand.js' );

const localVue = VueTestUtils.createLocalVue();
localVue.use( i18n );

// Sample test message
const sampleTest = 'sample test';

describe( 'SdCopyTextLayout Component', () => {
	it( 'renders successfully', () => {
		const wrapper = VueTestUtils.shallowMount( CopyTextLayout, {
			localVue,
			propsData: {
				copyText: sampleTest
			}
		} );

		const element = wrapper.find( '.sd-copy-text-layout' );
		expect( element.exists() ).toBe( true );
	} );

	it( 'text is same as text passed', () => {
		const wrapper = VueTestUtils.shallowMount( CopyTextLayout, {
			localVue,
			propsData: {
				copyText: sampleTest
			}
		} );

		const textElement = wrapper.find( '.sd-copy-text-layout__text' );
		expect( textElement.text() ).toEqual( sampleTest );
	} );

	it( 'text copied successfully', ( done ) => {
		const wrapper = VueTestUtils.mount( CopyTextLayout, {
			localVue,
			propsData: {
				copyText: sampleTest
			}
		} );
		document.execCommand.mockResolvedValue( true );

		const button = wrapper.find( '.sd-copy-text-layout__button' );
		button.trigger( 'click' );

		Vue.nextTick().then( () => {
			expect( document.execCommand ).toHaveBeenCalled();

			expect( global.mw.notify ).toHaveBeenCalled();

			expect( wrapper.emitted().copy ).toHaveLength( 1 );

			done();
		} );
	} );

	it( 'correct success message is shown if copied text successfully', ( done ) => {
		const successMessage = 'Copied link successfully';
		const wrapper = VueTestUtils.mount( CopyTextLayout, {
			localVue,
			propsData: {
				copyText: sampleTest,
				successMessage
			}
		} );
		document.execCommand.mockResolvedValue( true );

		const button = wrapper.find( '.sd-copy-text-layout__button' );
		button.trigger( 'click' );

		Vue.nextTick().then( () => {
			expect( global.mw.notify ).toHaveBeenCalledWith( successMessage );
			done();
		} );
	} );

	it( 'user is notified if copy fails', ( done ) => {
		const failMessage = 'Copied link successfully';
		const wrapper = VueTestUtils.mount( CopyTextLayout, {
			localVue,
			propsData: {
				copyText: sampleTest,
				failMessage
			}
		} );
		// Mock error
		document.execCommand.mockImplementation( () => {
			throw new Error( '' );
		} );

		const button = wrapper.find( '.sd-copy-text-layout__button' );
		button.trigger( 'click' );

		Vue.nextTick().then( () => {
			expect( document.execCommand ).toThrowError();

			expect( global.mw.notify ).toHaveBeenCalledWith( failMessage, { type: 'error' } );

			expect( wrapper.emitted().copy ).toBeUndefined();

			done();
		} );
	} );

	it( 'overflow is hidden if hideOverflow is passed as true', () => {
		const wrapper = VueTestUtils.shallowMount( CopyTextLayout, {
			localVue,
			propsData: {
				copyText: sampleTest,
				hideOverflow: true
			}
		} );

		expect( wrapper.classes() ).toContain( 'sd-copy-text-layout--hide-overflow' );
	} );

	it( 'is inline if inline is passed as true', () => {
		const wrapper = VueTestUtils.shallowMount( CopyTextLayout, {
			localVue,
			propsData: {
				copyText: sampleTest,
				inline: true
			}
		} );

		expect( wrapper.classes() ).toContain( 'sd-copy-text-layout--inline' );
	} );
} );
