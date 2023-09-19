<?php

namespace MediaWiki\Extension\MediaSearch;

use MediaWiki\Preferences\Hook\GetPreferencesHook;
use Message;

/**
 * MediaWiki hook handlers for the MediaSearch extension.
 *
 * @license GPL-2.0-or-later
 * @author Cormac Parle
 */
class MediaSearchHooks implements GetPreferencesHook {

	/**
	 * Handler for the GetPreferences hook
	 *
	 * @param \User $user
	 * @param array[] &$preferences
	 */
	public function onGetPreferences( $user, &$preferences ) {
		$preferences['search-special-page'] = [
			'type' => 'select',
			'section' => 'searchoptions/searchmisc',
			'label-message' => 'mediasearch-preference',
			'help-message' => 'mediasearch-preference-help',
			'options' => [
				wfMessage( 'mediasearch-preference-mediasearch-label' )
					->toString( Message::FORMAT_ESCAPED ) => 'MediaSearch',
				wfMessage( 'mediasearch-preference-specialsearch-label' )
					->toString( Message::FORMAT_ESCAPED ) => 'Search',
			]
		];

		$preferences['sdms-search-user-notice-dismissed'] = [
			'type' => 'api',
		];
	}
}
