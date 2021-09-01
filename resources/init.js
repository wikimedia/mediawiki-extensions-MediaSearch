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

	Vue.createMwApp( $.extend( { store: store }, App ) )
		.use( logger, {
			stream: 'mediawiki.mediasearch_interaction',
			schema: '/analytics/mediawiki/mediasearch_interaction/1.3.0'
		} )
		.mount( $vue.get( 0 ) );
}() );
