/**
 * Event logging plugin for Vue that connects with MediaWiki's Modern Event
 * Platform
 */

module.exports = {
	install: function ( app, options ) {
		const stream = options.stream,
			schema = options.schema,
			token = mw.user.getPageviewToken();

		/* eslint-disable camelcase */
		app.config.globalProperties.$log = function ( event ) {
			// if eventlogging is available, log this event (otherwise
			// this becomes a no-op)
			mw.loader.using( [ 'ext.eventLogging' ] ).then( () => {
				event.$schema = schema;
				event.web_pageview_id = token;
				event.language_code = mw.language.getFallbackLanguageChain()[ 0 ];
				event.ui_mw_skin = mw.config.get( 'skin' );

				mw.eventLog.submit( stream, event );
			} );
		};
		/* eslint-enable camelcase */
	}
};
