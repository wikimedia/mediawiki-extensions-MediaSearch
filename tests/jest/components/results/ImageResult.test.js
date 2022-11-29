const VueTestUtils = require( '@vue/test-utils' );
const Vue = require( 'vue' );
const ImageResult = require( '../../../../resources/components/results/ImageResult.vue' );
const ImageComponent = require( '../../../../resources/components/base/Image.vue' );
const when = require( 'jest-when' ).when;

// grab a random image result from the set
// Note: results are stored as key/value pairs based on pageid, not a straight array
const sampleResults = require( '../../fixtures/mockImageSearchApiResponse.json' ).query.pages;
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

describe( 'ImageResult', () => {
	beforeEach( () => {
		// Mock some pre-defined thumbnail values or else this component doesn't work
		when( global.mw.config.get )
			.calledWith( 'sdmsThumbLimits' )
			.mockReturnValue( thumbLimits );
	} );

	it( 'Renders successfully', () => {
		const wrapper = VueTestUtils.mount( ImageResult, {
			props: {
				title: sampleResult.title,
				canonicalurl: sampleResult.canonicalurl,
				imageinfo: sampleResult.imageinfo,
				index: sampleResult.index,
				name: sampleResult.name,
				entityterms: sampleResult.entityterms
			}
		} );

		expect( wrapper.html().length ).toBeGreaterThan( 0 );
	} );

	it( 'contains an Image component', () => {
		const wrapper = VueTestUtils.shallowMount( ImageResult, {
			props: {
				title: sampleResult.title,
				canonicalurl: sampleResult.canonicalurl,
				imageinfo: sampleResult.imageinfo,
				index: sampleResult.index,
				name: sampleResult.name,
				entityterms: sampleResult.entityterms
			}
		} );

		const Image = wrapper.findComponent( ImageComponent );
		expect( Image.exists() ).toBe( true );
	} );

	it( 'calculates its own "width" style rule based on result thumbnail dimensions', () => {
		const wrapper = VueTestUtils.shallowMount( ImageResult, {
			props: {
				title: sampleResult.title,
				canonicalurl: sampleResult.canonicalurl,
				imageinfo: sampleResult.imageinfo,
				index: sampleResult.index,
				name: sampleResult.name,
				entityterms: sampleResult.entityterms
			}
		} );
		expect( wrapper.vm.style ).toHaveProperty( 'width' );
		expect( parseInt( wrapper.vm.style.width ) ).toBeGreaterThanOrEqual( 60 );
		expect( parseInt( wrapper.vm.style.width ) ).not.toBeGreaterThan( 350 );
	} );

	it( 'applies a portrait class if the aspect ratio is greater than one', () => {
		const wrapper = VueTestUtils.shallowMount( ImageResult, {
			props: {
				title: sampleResult.title,
				canonicalurl: sampleResult.canonicalurl,
				imageinfo: sampleResult.imageinfo,
				index: sampleResult.index,
				name: sampleResult.name,
				entityterms: sampleResult.entityterms
			}
		} );

		if ( wrapper.vm.aspectRatio < 1 ) {
			expect( wrapper.classes() ).toContain( 'sdms-image-result--portrait' );
		} else {
			expect( wrapper.classes() ).not.toContain( 'sdms-image-result--portrait' );
		}
	} );

	it( 'contains a link element', () => {
		const wrapper = VueTestUtils.shallowMount( ImageResult, {
			props: {
				title: sampleResult.title,
				canonicalurl: sampleResult.canonicalurl,
				imageinfo: sampleResult.imageinfo,
				index: sampleResult.index,
				name: sampleResult.name,
				entityterms: sampleResult.entityterms
			}
		} );
		const link = wrapper.find( 'a' );
		expect( link.exists() ).toBe( true );
	} );

	it( 'clicking the link element causes a "show-details" event to be fired', ( done ) => {
		const wrapper = VueTestUtils.shallowMount( ImageResult, {
			props: {
				title: sampleResult.title,
				canonicalurl: sampleResult.canonicalurl,
				imageinfo: sampleResult.imageinfo,
				index: sampleResult.index,
				name: sampleResult.name,
				entityterms: sampleResult.entityterms
			}
		} );

		wrapper.find( 'a' ).trigger( 'click' );
		Vue.nextTick().then( () => {
			expect( wrapper.emitted()[ 'show-details' ] ).toHaveLength( 1 );
			done();
		} );
	} );

	it( 'the "show-details" event includes the result title in its payload', ( done ) => {
		const wrapper = VueTestUtils.shallowMount( ImageResult, {
			props: {
				title: sampleResult.title,
				canonicalurl: sampleResult.canonicalurl,
				imageinfo: sampleResult.imageinfo,
				index: sampleResult.index,
				name: sampleResult.name,
				entityterms: sampleResult.entityterms
			}
		} );

		wrapper.find( 'a' ).trigger( 'click' );
		Vue.nextTick().then( () => {
			expect( wrapper.emitted()[ 'show-details' ][ 0 ][ 0 ] ).toBe( sampleResult.title );
			done();
		} );
	} );
} );
