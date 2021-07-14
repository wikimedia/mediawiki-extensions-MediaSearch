const VueTestUtils = require( '@vue/test-utils' );
const Vue = require( 'vue' );
const i18n = require( '../plugins/i18n.js' );
const OtherResult = require( '../../../resources/components/results/OtherResult.vue' );
const when = require( 'jest-when' ).when;

// grab a random image result from the set
// Note: results are stored as key/value pairs based on pageid, not a straight array
const sampleResults = require( '../fixtures/mockOtherSearchApiResponse.json' ).query.pages;
const sampleResultIDs = Object.keys( sampleResults );
const randomlyChosenResultID = sampleResultIDs[ Math.floor( Math.random() * sampleResultIDs.length ) ];
const sampleResult = sampleResults[ randomlyChosenResultID ];

const thumbLimits = [
	120, 150, 180, 200,
	220, 225, 240, 250,
	270, 300, 330, 360,
	375, 400, 440, 450,
	500, 600, 800
];

const localVue = VueTestUtils.createLocalVue();
localVue.use( i18n );

describe( 'OtherResult', () => {
	beforeEach( () => {
		// Mock some pre-defined thumbnail values or else this component doesn't work
		when( global.mw.config.get )
			.calledWith( 'sdmsThumbLimits' )
			.mockReturnValue( thumbLimits );
	} );

	it( 'Renders successfully', () => {
		const wrapper = VueTestUtils.mount( OtherResult, {
			localVue,
			propsData: {
				title: sampleResult.title,
				index: sampleResult.index,
				pageid: sampleResult.pageid,
				canonicalurl: sampleResult.canonicalurl,
				imageinfo: sampleResult.imageinfo
			}
		} );

		const element = wrapper.find( '.sdms-other-result' );
		expect( element.exists() ).toBe( true );
	} );

	it( 'renders two link elements', () => {
		const wrapper = VueTestUtils.shallowMount( OtherResult, {
			localVue,
			propsData: {
				title: sampleResult.title,
				index: sampleResult.index,
				pageid: sampleResult.pageid,
				canonicalurl: sampleResult.canonicalurl,
				imageinfo: sampleResult.imageinfo
			}
		} );

		const linkElements = wrapper.findAll( 'a' );
		expect( linkElements.length ).toBe( 2 );
	} );

	it( 'renders a sdms-image component', () => {
		const wrapper = VueTestUtils.shallowMount( OtherResult, {
			localVue,
			propsData: {
				title: sampleResult.title,
				index: sampleResult.index,
				pageid: sampleResult.pageid,
				canonicalurl: sampleResult.canonicalurl,
				imageinfo: sampleResult.imageinfo
			}
		} );
		const sdImageComponent = wrapper.findComponent( { name: 'SdImage' } );
		expect( sdImageComponent.exists() ).toBe( true );
	} );

	it( 'clicking the thumbnail wrapper link element causes a "click" event to be fired', done => {
		const wrapper = VueTestUtils.shallowMount( OtherResult, {
			localVue,
			propsData: {
				title: sampleResult.title,
				index: sampleResult.index,
				pageid: sampleResult.pageid,
				canonicalurl: sampleResult.canonicalurl,
				imageinfo: sampleResult.imageinfo
			}
		} );

		wrapper.find( '.sdms-other-result__thumbnail-wrapper' ).trigger( 'click' );
		Vue.nextTick().then( () => {
			expect( wrapper.emitted().click ).toHaveLength( 1 );
			done();
		} );
	} );

	it( 'renders an heading element', () => {
		const wrapper = VueTestUtils.shallowMount( OtherResult, {
			localVue,
			propsData: {
				title: sampleResult.title,
				index: sampleResult.index,
				pageid: sampleResult.pageid,
				canonicalurl: sampleResult.canonicalurl,
				imageinfo: sampleResult.imageinfo
			}
		} );
		const headingElements = wrapper.findAll( 'h3' );
		expect( headingElements.exists() ).toBe( true );
	} );

	it( 'clicking the heading link element causes a "click" event to be fired', done => {
		const wrapper = VueTestUtils.shallowMount( OtherResult, {
			localVue,
			propsData: {
				title: sampleResult.title,
				index: sampleResult.index,
				pageid: sampleResult.pageid,
				canonicalurl: sampleResult.canonicalurl,
				imageinfo: sampleResult.imageinfo
			}
		} );

		wrapper.find( 'h3 a' ).trigger( 'click' );
		Vue.nextTick().then( () => {
			expect( wrapper.emitted().click ).toHaveLength( 1 );
			done();
		} );
	} );

	it( 'Contains the sample formatted extension', () => {
		const wrapper = VueTestUtils.mount( OtherResult, {
			localVue,
			propsData: {
				title: sampleResult.title,
				index: sampleResult.index,
				pageid: sampleResult.pageid,
				canonicalurl: sampleResult.canonicalurl,
				imageinfo: sampleResult.imageinfo
			}
		} );

		const element = wrapper.find( '.sdms-other-result__extension' );
		expect( element.exists() ).toBe( true );
	} );

	it( 'Contains the sample formatted resolution', () => {
		const wrapper = VueTestUtils.mount( OtherResult, {
			localVue,
			propsData: {
				title: sampleResult.title,
				index: sampleResult.index,
				pageid: sampleResult.pageid,
				canonicalurl: sampleResult.canonicalurl,
				imageinfo: sampleResult.imageinfo
			}
		} );

		const element = wrapper.find( '.sdms-other-result__resolution' );
		expect( element.exists() ).toBe( true );
	} );

	it( 'Contains the sample image size', () => {
		const wrapper = VueTestUtils.mount( OtherResult, {
			localVue,
			propsData: {
				title: sampleResult.title,
				index: sampleResult.index,
				pageid: sampleResult.pageid,
				canonicalurl: sampleResult.canonicalurl,
				imageinfo: sampleResult.imageinfo
			}
		} );

		const element = wrapper.find( '.sdms-other-result__imageSize' );
		expect( element.exists() ).toBe( true );
	} );
} );
