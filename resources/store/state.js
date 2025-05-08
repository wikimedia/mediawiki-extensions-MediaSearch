const AUTOLOAD_COUNT = 2;
const initialResults = mw.config.get( 'sdmsInitialSearchResults' );
const initialFilters = JSON.parse( mw.config.get( 'sdmsInitialFilters' ) );
const didYouMean = mw.config.get( 'sdmsDidYouMean' );
const ensureArray = require( './../ensureArray.js' );
const sortedResults = ensureArray( initialResults.results || [] ).sort( ( a, b ) => a.index - b.index );
const mwUri = new mw.Uri();

module.exports = {

	/**
	 * Suggested alternate search term, if any
	 */
	didYouMean: didYouMean,

	/**
	 * Warnings from the executed search query
	 */
	searchWarnings: initialResults.searchWarnings || null,

	/**
	 * Boolean flag indicating whether the search has errored
	 */
	hasError: mw.config.get( 'sdmsHasError' ),

	/**
	 * Arrays of objects broken down by type
	 */
	results: {
		image: initialResults.activeType === 'image' ? sortedResults : [],
		audio: initialResults.activeType === 'audio' ? sortedResults : [],
		video: initialResults.activeType === 'video' ? sortedResults : [],
		page: initialResults.activeType === 'page' ? sortedResults : [],
		other: initialResults.activeType === 'other' ? sortedResults : []
	},

	/**
	 * Per-tab value for continue will be one of 3 things:
	 * 1. Offset value where the next batch of results should start (string)
	 * 2. undefined (representing that we don't know if there are more
	 *    results because we haven't done a search API call yet)
	 * 3. null (representing that there are no more results)
	 */
	continue: {
		image: initialResults.activeType === 'image' ? initialResults.continue : undefined,
		audio: initialResults.activeType === 'audio' ? initialResults.continue : undefined,
		video: initialResults.activeType === 'video' ? initialResults.continue : undefined,
		page: initialResults.activeType === 'page' ? initialResults.continue : undefined,
		other: initialResults.activeType === 'other' ? initialResults.continue : undefined
	},

	pending: {
		image: false,
		audio: false,
		video: false,
		page: false,
		other: false
	},

	/**
	 * Total number of search results.
	 */
	totalHits: {
		image: initialResults.activeType === 'image' ? initialResults.totalHits : 0,
		audio: initialResults.activeType === 'audio' ? initialResults.totalHits : 0,
		video: initialResults.activeType === 'video' ? initialResults.totalHits : 0,
		page: initialResults.activeType === 'page' ? initialResults.totalHits : 0,
		other: initialResults.activeType === 'other' ? initialResults.totalHits : 0
	},

	filterValues: {
		image: initialResults.activeType === 'image' ? initialFilters : {},
		audio: initialResults.activeType === 'audio' ? initialFilters : {},
		video: initialResults.activeType === 'video' ? initialFilters : {},
		page: initialResults.activeType === 'page' ? initialFilters : {},
		other: initialResults.activeType === 'other' ? initialFilters : {}
	},

	details: {
		image: null,
		audio: null,
		video: null,
		page: null,
		other: null
	},

	/**
	 * Whether the app is fully initialized (app mounted, images resolved).
	 */
	initialized: false,

	/**
	 * Local instance of the query paramethers avaialable within the URI library
	 */
	uriQuery: mwUri.query,
	/**
	 * Object with keys corresponding to the number of automatic search request
	 * left for each individual MediaType
	 */
	autoloadCounter: {
		image: AUTOLOAD_COUNT,
		audio: AUTOLOAD_COUNT,
		video: AUTOLOAD_COUNT,
		page: AUTOLOAD_COUNT,
		other: AUTOLOAD_COUNT
	}
};
