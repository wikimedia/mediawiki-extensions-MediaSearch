<?php

namespace MediaWiki\Extension\MediaSearch;

use MediaWiki\MediaWikiServices;

/**
 * MediaWiki hook handlers for the MediaSearch extension.
 *
 * @license GPL-2.0-or-later
 * @author Cormac Parle
 */
class MediaSearchHooks {

	/**
	 * @param \OutputPage $out
	 * @param \Skin $skin
	 */
	public static function onBeforePageDisplay( $out, $skin ) {
		$hooksObject = new self();
		$hooksObject->doBeforePageDisplay(
			$out,
			$skin
		);
	}

	/**
	 * Return the default search page, according to the user's preference.
	 *
	 * @param \User $user
	 * @return \Title
	 */
	private function getDefaultSearchPage( \User $user ) {
		$userOptionsManager = MediaWikiServices::getInstance()->getUserOptionsManager();
		if ( !$userOptionsManager->getOption( $user, 'sdms-specialsearch-default' ) ) {
			return \SpecialPage::getTitleFor( 'NewMediaSearch' );
		}
		return \SpecialPage::getTitleFor( 'Search' );
	}

	/**
	 * @param \OutputPage $out
	 * @param \Skin $skin
	 * @throws \OOUI\Exception
	 */
	public function doBeforePageDisplay(
		$out,
		$skin
	) {
		// change search bar destination
		$skin->setSearchPageTitle( $this->getDefaultSearchPage( $out->getUser() ) );
	}

	/**
	 * Handler for the GetPreferences hook
	 *
	 * @param \User $user
	 * @param array[] &$preferences
	 */
	public static function onGetPreferences( \User $user, array &$preferences ) {
		$preferences['sdms-specialsearch-default'] = [
			'type' => 'toggle',
			'section' => 'searchoptions/searchmisc',
			'label-message' => 'mediasearch-specialsearch-default',
			'help-message' => 'mediasearch-specialsearch-default-help',
		];

		$preferences['sdms-search-user-notice-dismissed'] = [
			'type' => 'api',
		];
	}
}
