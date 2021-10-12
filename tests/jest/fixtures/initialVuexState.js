// Object representing the default starting state in vuex when no search has yet
// been made
module.exports = {
	didYouMean: null,
	hasError: false,
	results: {
		image: [],
		audio: [],
		video: [],
		page: [],
		other: []
	},
	continue: {
		image: undefined,
		audio: undefined,
		video: undefined,
		page: undefined,
		other: undefined
	},
	pending: {
		image: false,
		audio: false,
		video: false,
		page: false,
		other: false
	},
	totalHits: {
		image: 0,
		audio: 0,
		video: 0,
		page: 0,
		other: 0
	},
	filterValues: {
		image: {},
		audio: {},
		video: {},
		page: {},
		other: {}
	},
	details: {
		image: null,
		audio: null,
		video: null,
		page: null,
		other: null
	},
	initialized: false,
	uriQuery: {}
};
