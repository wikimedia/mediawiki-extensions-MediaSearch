'use strict';

module.exports = ( function () {
	/**
	 * @param {string} url
	 * @return {string}
	 */
	function getHost( url ) {
		var parser = document.createElement( 'a' );

		// Internet Explorer returns an incomplete host (without port) when the protocol is missing.
		if ( /^\/\//.test( url ) ) {
			url = location.protocol + url;
		}

		parser.href = url;
		return parser.host;
	}

	/**
	 * Returns a `mediaWiki.Api` instance which can transparently interact with remote APIs.
	 *
	 * This is a copy of wikibase.api.getLocationAgnosticMwApi.
	 *
	 * @param {string} apiEndpoint
	 * @param {Object} [options]
	 * @return {mediaWiki.Api}
	 */
	return function getLocationAgnosticMwApi( apiEndpoint, options ) {
		var mwApiOptions = $.extend( {}, options, { ajax: { url: apiEndpoint } } );

		if ( getHost( apiEndpoint ) !== getHost( location.href ) ) {
			// Use mw.ForeignApi if the api we want to use is on a different domain.
			return new mw.ForeignApi( apiEndpoint, options );
		}

		return new mw.Api( mwApiOptions );
	};
}() );
