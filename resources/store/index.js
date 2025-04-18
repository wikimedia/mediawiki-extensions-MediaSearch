const Vuex = require( 'vuex' );
const state = require( './state.js' );
const getters = require( './getters.js' );
const mutations = require( './mutations.js' );
const actions = require( './actions.js' );

/**
 * Vuex Store: shared application state lives here
 */
module.exports = new Vuex.Store( {
	/**
	 * The mutable state of the store; state is an object with various
	 * properties. Only mutations are allowd to alter values in state.
	 */
	state: state,

	/**
	 * Getters are like computed properties for Vuex state; derived attributes
	 */
	getters: getters,

	/**
	 * State can only be modified by mutations, which must be synchronous.
	 * Each mutation is called with the state as its first argument; additional
	 * arguments are allowed.
	 */
	mutations: mutations,

	/**
	 * Actions are functions that may be dispatched by components or inside of
	 * other actions. They are called with a context argument and an optional
	 * payload argument. Actions may be asynchronous but do not have to be.
	 */
	actions: actions
} );
