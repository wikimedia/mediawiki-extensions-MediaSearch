const VueTestUtils = require( '@vue/test-utils' );
const Icon = require( '../../../../resources/components/base/Icon.vue' );
const icons = require( '../../../../lib/icons.js' );

describe( 'Icon Component', () => {
	it( 'renders successfully', () => {
		const wrapper = VueTestUtils.shallowMount( Icon, {
			propsData: {
				icon: icons.sdIconAlert
			}
		} );

		const element = wrapper.find( '.sd-icon' );
		expect( element.exists() ).toBe( true );
	} );

	it( 'icon is filled with iconColor prop value', () => {
		const color = '#000000';
		const wrapper = VueTestUtils.shallowMount( Icon, {
			propsData: {
				icon: icons.sdIconAlert,
				iconColor: color
			}
		} );

		const svgElement = wrapper.find( '.sd-icon svg g' );

		expect( svgElement.attributes( 'fill' ) ).toBe( color );
	} );

	it( 'renders path if icon is string', () => {

		const wrapper = VueTestUtils.shallowMount( Icon, {
			propsData: {
				icon: icons.sdIconAlert,
				iconTitle: 'Alert Icon'
			}
		} );

		const path = wrapper.find( '.sd-icon svg path' );
		expect( path.attributes().d ).toBe( icons.sdIconAlert );

	} );

	it( 'renders path if icon is an object containing path', () => {

		const iconElement = {
			path: icons.sdIconAlert
		};
		const wrapper = VueTestUtils.shallowMount( Icon, {
			propsData: {
				icon: iconElement,
				iconTitle: 'Alert Icon'
			}
		} );

		const path = wrapper.find( '.sd-icon svg path' );
		expect( path.attributes().d ).toBe( iconElement.path );

	} );

	it( 'renders rtl as path if icon is an object that contains rtl and document.documentElement.dir is rtl', () => {

		document.documentElement.dir = 'rtl';

		const iconElement = {
			rtl: icons.sdIconAlert
		};

		const wrapper = VueTestUtils.shallowMount( Icon, {
			propsData: {
				icon: iconElement
			}
		} );

		const path = wrapper.find( '.sd-icon svg path' );
		expect( path.attributes().d ).toBe( iconElement.rtl );

	} );

	it( 'renders ltr if icon shouldFlipExceptions contains langCode', () => {

		document.documentElement.dir = 'rtl';

		const iconElement = {
			shouldFlipExceptions: 'en',
			rtl: icons.sdIconAlert
		};

		const wrapper = VueTestUtils.shallowMount( Icon, {
			propsData: {
				icon: iconElement,
				langCode: 'en'
			}
		} );

		expect( wrapper.classes() ).not.toContain( 'sd-icon--flip-for-rtl' );

	} );

	it( 'renders langCodeMap langCode path string if langCodeMap object contains langCode', () => {

		document.documentElement.dir = 'rtl';

		const iconElement = {
			langCodeMap: {
				en: {
					path: icons.sdIconAlert
				}
			}
		};

		const wrapper = VueTestUtils.shallowMount( Icon, {
			propsData: {
				icon: iconElement,
				langCode: 'en'
			}
		} );

		const path = wrapper.find( '.sd-icon svg path' );
		expect( path.attributes().d ).toBe( iconElement.langCodeMap.en.path );

	} );

	it( 'renders default if passed in icon object and document.documentElement.dir is not rtl', () => {

		document.documentElement.dir = 'ltr';
		const iconElement = {
			default: icons.sdIconAlert
		};

		const wrapper = VueTestUtils.shallowMount( Icon, {
			propsData: {
				icon: iconElement
			}
		} );

		const path = wrapper.find( '.sd-icon svg path' );
		expect( path.attributes().d ).toBe( iconElement.default );

	} );

	it( 'should flip if shouldflip is passed in icon object', () => {

		const iconElement = {
			shouldFlip: true,
			path: icons.sdIconAlert
		};
		const wrapper = VueTestUtils.shallowMount( Icon, {
			propsData: {
				icon: iconElement,
				iconTitle: 'Alert Icon'
			}
		} );

		expect( wrapper.classes() ).toContain( 'sd-icon--flip-for-rtl' );

	} );

} );
