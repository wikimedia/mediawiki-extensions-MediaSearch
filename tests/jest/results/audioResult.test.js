const VueTestUtils = require( '@vue/test-utils' );
const Vue = require( 'vue' );
const AudioResult = require( '../../../resources/components/results/AudioResult.vue' );
const when = require( 'jest-when' ).when;

// grab a random image result from the set
// Note: results are stored as key/value pairs based on title, not a straight array
const sampleResults = require( '../fixtures/mockAudioSearchApiResponse.json' ).query.pages;
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

describe( 'AudioResult', () => {
	beforeEach( () => {
		// Mock some pre-defined thumbnail values or else this component doesn't work
		when( global.mw.config.get )
			.calledWith( 'sdmsThumbLimits' )
			.mockReturnValue( thumbLimits );
	} );

	it( 'Renders successfully', () => {
		const wrapper = VueTestUtils.mount( AudioResult, {
			propsData: {
				title: sampleResult.title,
				canonicalurl: sampleResult.canonicalurl,
				imageinfo: sampleResult.imageinfo,
				index: sampleResult.index,
				name: sampleResult.name,
				entityterms: sampleResult.entityterms
			}
		} );

		const element = wrapper.find( '.sdms-audio-result' );
		expect( element.exists() ).toBe( true );
	} );

	it( 'contains an element displaying a formattedDuration', () => {
		const wrapper = VueTestUtils.shallowMount( AudioResult, {
			propsData: {
				title: sampleResult.title,
				canonicalurl: sampleResult.canonicalurl,
				imageinfo: sampleResult.imageinfo,
				index: sampleResult.index,
				name: sampleResult.name,
				entityterms: sampleResult.entityterms
			}
		} );
		const durationElement = wrapper.find( '.sdms-audio-result__duration__text' );
		expect( durationElement.exists() ).toBe( true );
	} );

	it( 'contains an element containing a mime type', () => {
		const wrapper = VueTestUtils.shallowMount( AudioResult, {
			propsData: {
				title: sampleResult.title,
				canonicalurl: sampleResult.canonicalurl,
				imageinfo: sampleResult.imageinfo,
				index: sampleResult.index,
				name: sampleResult.name,
				entityterms: sampleResult.entityterms
			}
		} );
		const mimeElement = wrapper.find( '.sdms-audio-result__mime' );
		expect( mimeElement.exists() ).toBe( true );
	} );

	it( 'contains a link element', () => {
		const wrapper = VueTestUtils.shallowMount( AudioResult, {
			propsData: {
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

	it( 'clicking the link element causes a "show-details" event to be fired', done => {
		const wrapper = VueTestUtils.shallowMount( AudioResult, {
			propsData: {
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

	it( 'the "show-details" event includes the result title in its payload', done => {
		const wrapper = VueTestUtils.shallowMount( AudioResult, {
			propsData: {
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
