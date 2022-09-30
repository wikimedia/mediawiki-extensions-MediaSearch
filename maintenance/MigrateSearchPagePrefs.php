<?php

namespace MediaWiki\Extension\MediaSearch\Maintenance;

use Maintenance;

$IP = getenv( 'MW_INSTALL_PATH' );
if ( $IP === false ) {
	$IP = __DIR__ . '/../../..';
}
require_once "$IP/maintenance/Maintenance.php";

/**
 * Migrate users from sdms-specialsearch-default to the core search-special-page preference.
 *
 * Users used to indicate their preference for Special:Search instead of Special:MediaSearch
 * via the extension-owned `sdms-specialsearch-default` preference. There is now a core
 * preference for this, called `search-special-page`.
 */
class MigrateSearchPagePrefs extends Maintenance {

	public function __construct() {
		parent::__construct();
		$this->addDescription( 'Migrate users from sdms-specialsearch-default to the core '
			. 'search-special-page preference' );

		$this->requireExtension( 'MediaSearch' );
	}

	public function execute() {
		$dbr = $this->getDB( DB_REPLICA );
		$userIds = $dbr->selectFieldValues(
			'user_properties',
			'up_user',
			[
				'up_property' => 'sdms-specialsearch-default',
				'up_value' => 1,
			],
			__METHOD__
		);
		if ( !$userIds ) {
			return;
		}

		$dbw = $this->getDB( DB_PRIMARY );
		$this->beginTransaction( $dbw, __METHOD__ );
		$dbw->insert(
			'user_properties',
			array_map( static function ( $userId ) {
				return [
					'up_user' => $userId,
					'up_property' => 'search-special-page',
					'up_value' => 'Search',
				];
			}, $userIds ),
			__METHOD__
		);
		$dbw->delete(
			'user_properties',
			[
				'up_user' => $userIds,
				'up_property' => [ 'sdms-specialsearch-default' ],
			],
			__METHOD__
		);
		$this->commitTransaction( $dbw, __METHOD__ );
	}
}

$maintClass = MigrateSearchPagePrefs::class;
require_once RUN_MAINTENANCE_IF_MAIN;
