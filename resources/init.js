'use strict';

( function () {
	var Vue = require( 'vue' ),
		App = require( './components/App.vue' ),
		logger = require( './plugins/eventLogger.js' ),
		store = require( './store/index.js' ),
		$container = $( '<div>' ).attr( 'id', 'sdms-app' ),
		$vue = $( '<div>' ).appendTo( $container );

	/* eslint-disable no-jquery/no-global-selector */
	$( '#mw-content-text' ).append( $container.hide() );

	var vueApp = Vue.createMwApp( App )
		.use( store )
		.use( logger, {
			stream: 'mediawiki.mediasearch_interaction',
			schema: '/analytics/mediawiki/mediasearch_interaction/1.4.0'
		} );

	// Use this to prevent vue 3 default space trim
	vueApp.config.compilerOptions.whitespace = 'preserve';

	vueApp.mount( $vue.get( 0 ) );
}() );
