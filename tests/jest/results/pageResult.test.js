const VueTestUtils = require( '@vue/test-utils' );
const Vue = require( 'vue' );
const i18n = require( '../plugins/i18n.js' );
const PageResult = require( '../../../resources/components/results/PageResult.vue' );
const when = require( 'jest-when' ).when;

// grab a random image result from the set
// Note: results are stored as key/value pairs based on pageid, not a straight array
const sampleResults = require( '../fixtures/mockPageSearchApiResponse.json' ).query.pages;
const sampleResultIDs = Object.keys( sampleResults );
const randomlyChosenResultID = sampleResultIDs[ Math.floor( Math.random() * sampleResultIDs.length ) ];
const sampleResult = sampleResults[ randomlyChosenResultID ];

// We create a list of ID that have the cateory info. this is used in some of the conditional render ofthe component
const sampleResultWithCategoryInfoIDs = sampleResultIDs.filter( id => sampleResults[ id ].categoryinfo && Object.keys( sampleResults[ id ].categoryinfo ).length > 0 );
const randomlyChosenResultIDWithCategoryInfo = sampleResultWithCategoryInfoIDs[ Math.floor( Math.random() * sampleResultWithCategoryInfoIDs.length ) ];
const sampleResultWithCategoryInfo = sampleResults[ randomlyChosenResultIDWithCategoryInfo ];

const thumbLimits = [
	120, 150, 180, 200,
	220, 225, 240, 250,
	270, 300, 330, 360,
	375, 400, 440, 450,
	500, 600, 800
];

const localVue = VueTestUtils.createLocalVue();
localVue.use( i18n );

describe( 'PageResult', () => {
	beforeEach( () => {
		// Mock some pre-defined thumbnail values or else this component doesn't work
		when( global.mw.config.get )
			.calledWith( 'sdmsThumbLimits' )
			.mockReturnValue( thumbLimits );
	} );

	it( 'Renders successfully', () => {
		const wrapper = VueTestUtils.mount( PageResult, {
			propsData: {
				title: sampleResult.title,
				index: sampleResult.index,
				pageid: sampleResult.pageid,
				canonicalurl: sampleResult.canonicalurl

			}
		} );

		const element = wrapper.find( '.sdms-page-result' );
		expect( element.exists() ).toBe( true );
	} );

	it( 'renders a snippets as HTML', () => {
		const dummyHtmlSnippet = '<div class="dummy_snippet"></div>';
		const wrapper = VueTestUtils.shallowMount( PageResult, {
			propsData: {
				title: sampleResult.title,
				index: sampleResult.index,
				pageid: sampleResult.pageid,
				canonicalurl: sampleResult.canonicalurl,
				snippet: dummyHtmlSnippet
			}
		} );
		const snippetElement = wrapper.find( '.dummy_snippet' );
		expect( snippetElement.exists() ).toBe( true );
	} );

	it( 'renders category text when categoryInfo is available', () => {
		const wrapper = VueTestUtils.shallowMount( PageResult, {
			localVue,
			propsData: {
				title: sampleResultWithCategoryInfo.title,
				index: sampleResultWithCategoryInfo.index,
				pageid: sampleResultWithCategoryInfo.pageid,
				canonicalurl: sampleResultWithCategoryInfo.canonicalurl,
				categoryinfo: sampleResultWithCategoryInfo.categoryinfo
			}
		} );
		const categoryInfoElement = wrapper.find( '.sdms-page-result__category-info' );
		expect( categoryInfoElement.exists() ).toBe( true );
	} );

	it( 'renders size text when value available', () => {
		const wrapper = VueTestUtils.shallowMount( PageResult, {
			propsData: {
				title: sampleResult.title,
				index: sampleResult.index,
				pageid: sampleResult.pageid,
				canonicalurl: sampleResult.canonicalurl,
				size: sampleResult.size
			}
		} );
		const sizeElement = wrapper.find( '.sdms-page-result__size' );
		expect( sizeElement.exists() ).toBe( true );
	} );

	it( 'renders wordcount text when value available', () => {
		const wrapper = VueTestUtils.shallowMount( PageResult, {
			localVue,
			propsData: {
				title: sampleResult.title,
				index: sampleResult.index,
				pageid: sampleResult.pageid,
				canonicalurl: sampleResult.canonicalurl,
				wordcount: sampleResult.wordcount
			}
		} );
		const wordcountElement = wrapper.find( '.sdms-page-result__wordcount' );
		expect( wordcountElement.exists() ).toBe( true );
	} );

	it( 'contains a link element', () => {
		const wrapper = VueTestUtils.shallowMount( PageResult, {
			propsData: {
				title: sampleResult.title,
				index: sampleResult.index,
				pageid: sampleResult.pageid,
				canonicalurl: sampleResult.canonicalurl
			}
		} );
		const link = wrapper.find( 'a' );
		expect( link.exists() ).toBe( true );
	} );

	it( 'clicking the link element causes a "click" event to be fired', done => {
		const wrapper = VueTestUtils.shallowMount( PageResult, {
			propsData: {
				title: sampleResult.title,
				index: sampleResult.index,
				pageid: sampleResult.pageid,
				canonicalurl: sampleResult.canonicalurl
			}
		} );

		wrapper.find( 'a' ).trigger( 'click' );
		Vue.nextTick().then( () => {
			expect( wrapper.emitted().click ).toHaveLength( 1 );
			done();
		} );
	} );
} );
