const VueTestUtils = require( '@vue/test-utils' );
const Vue = require( 'vue' );
const QuickView = require( '../../resources/components/QuickView.vue' );
const i18n = require( './plugins/i18n.js' );
const when = require( 'jest-when' ).when;

// grab a random image result from the set
// Note: results are stored as key/value pairs based on pageid, not a straight array
const sampleResults = require( './fixtures/mockSearchApiResponse.json' ).query.pages;
const sampleResultIDs = Object.keys( sampleResults );
const randomlyChosenResultID = sampleResultIDs[ Math.floor( Math.random() * sampleResultIDs.length ) ];
const sampleResult = sampleResults[ randomlyChosenResultID ];

const localVue = VueTestUtils.createLocalVue();
localVue.use( i18n );

describe( 'QuickView', () => {
	beforeEach( () => {
		when( global.mw.config.get )
			.calledWith( 'wgUserLanguage' )
			.mockReturnValue( 'en' );
	} );

	describe( 'when image data is provided', () => {
		it( 'Renders successfully', () => {
			const wrapper = VueTestUtils.mount( QuickView, {
				localVue,
				propsData: {
					title: sampleResult.title,
					canonicalurl: sampleResult.canonicalurl,
					pageid: sampleResult.pageid,
					imageinfo: sampleResult.imageinfo,
					mediaType: 'image',
					isDialog: false
				}
			} );

			expect( wrapper.html().length ).toBeGreaterThan( 0 );
		} );

		it( 'displays a header image', () => {
			const wrapper = VueTestUtils.shallowMount( QuickView, {
				localVue,
				propsData: {
					title: sampleResult.title,
					canonicalurl: sampleResult.canonicalurl,
					pageid: sampleResult.pageid,
					imageinfo: sampleResult.imageinfo,
					mediaType: 'image',
					isDialog: false
				}
			} );

			const img = wrapper.find( 'header img' );
			expect( img.exists() ).toBe( true );
		} );

		it( 'displays close, next, and previous buttons', () => {
			const wrapper = VueTestUtils.shallowMount( QuickView, {
				localVue,
				propsData: {
					title: sampleResult.title,
					canonicalurl: sampleResult.canonicalurl,
					pageid: sampleResult.pageid,
					imageinfo: sampleResult.imageinfo,
					mediaType: 'image',
					isDialog: false
				}
			} );

			// Apparently using "find" with "ref" option is deprecated;
			// we need to use findComponent here, even though the refs
			// live on plain elements in the template
			const close = wrapper.findComponent( { ref: 'close' } );
			const next = wrapper.findComponent( { ref: 'next' } );
			const prev = wrapper.findComponent( { ref: 'previous' } );

			expect( close.exists() ).toBe( true );
			expect( next.exists() ).toBe( true );
			expect( prev.exists() ).toBe( true );
		} );

		it( 'emits a "close" event when the close button is clicked', done => {
			const wrapper = VueTestUtils.shallowMount( QuickView, {
				localVue,
				propsData: {
					title: sampleResult.title,
					canonicalurl: sampleResult.canonicalurl,
					pageid: sampleResult.pageid,
					imageinfo: sampleResult.imageinfo,
					mediaType: 'image',
					isDialog: false
				}
			} );

			const close = wrapper.findComponent( { ref: 'close' } );
			close.trigger( 'click' );

			Vue.nextTick().then( () => {
				expect( wrapper.emitted().close ).toHaveLength( 1 );
				done();
			} );
		} );

		it( 'emits a "next" event when the next button is clicked', done => {
			const wrapper = VueTestUtils.shallowMount( QuickView, {
				localVue,
				propsData: {
					title: sampleResult.title,
					canonicalurl: sampleResult.canonicalurl,
					pageid: sampleResult.pageid,
					imageinfo: sampleResult.imageinfo,
					mediaType: 'image',
					isDialog: false
				}
			} );

			const next = wrapper.findComponent( { ref: 'next' } );
			next.trigger( 'click' );

			Vue.nextTick().then( () => {
				expect( wrapper.emitted().next ).toHaveLength( 1 );
				done();
			} );
		} );

		it( 'emits a "previous" event when the previous button is clicked', done => {
			const wrapper = VueTestUtils.shallowMount( QuickView, {
				localVue,
				propsData: {
					title: sampleResult.title,
					canonicalurl: sampleResult.canonicalurl,
					pageid: sampleResult.pageid,
					imageinfo: sampleResult.imageinfo,
					mediaType: 'image',
					isDialog: false
				}
			} );

			const prev = wrapper.findComponent( { ref: 'previous' } );
			prev.trigger( 'click' );

			Vue.nextTick().then( () => {
				expect( wrapper.emitted().previous ).toHaveLength( 1 );
				done();
			} );
		} );

		it( 'applies the appropriate class to the base element', () => {
			const wrapper = VueTestUtils.shallowMount( QuickView, {
				localVue,
				propsData: {
					title: sampleResult.title,
					canonicalurl: sampleResult.canonicalurl,
					pageid: sampleResult.pageid,
					imageinfo: sampleResult.imageinfo,
					mediaType: 'image',
					isDialog: false
				}
			} );

			expect( wrapper.classes() ).toContain( 'sdms-quick-view--image' );
		} );

		it( 'contains a "more details" call-to-action button', () => {
			const wrapper = VueTestUtils.shallowMount( QuickView, {
				localVue,
				propsData: {
					title: sampleResult.title,
					canonicalurl: sampleResult.canonicalurl,
					pageid: sampleResult.pageid,
					imageinfo: sampleResult.imageinfo,
					mediaType: 'image',
					isDialog: false
				}
			} );

			const moreDetails = wrapper.find( 'a.sdms-quick-view__cta' );
			expect( moreDetails.exists() ).toBe( true );
			expect( moreDetails.attributes().href ).toBe( sampleResult.canonicalurl );
		} );

	} );
} );
