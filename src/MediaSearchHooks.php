<?php

namespace MediaWiki\Extension\MediaSearch;

use MediaWiki\Preferences\Hook\GetPreferencesHook;
use MediaWiki\User\User;

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
	 * @param User $user
	 * @param array[] &$preferences
	 */
	public function onGetPreferences( $user, &$preferences ) {
		$preferences['search-special-page'] = [
			'type' => 'select',
			'section' => 'searchoptions/searchmisc',
			'label-message' => 'mediasearch-preference',
			'help-message' => 'mediasearch-preference-help',
			'options-messages' => [
				'mediasearch-preference-mediasearch-label' => 'MediaSearch',
				'mediasearch-preference-specialsearch-label' => 'Search',
			]
		];

		$preferences['sdms-search-user-notice-dismissed'] = [
			'type' => 'api',
		];
	}
}
