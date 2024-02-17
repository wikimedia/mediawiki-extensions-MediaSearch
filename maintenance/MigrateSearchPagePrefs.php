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
		$dbr = $this->getReplicaDB();
		$userIds = $dbr->newSelectQueryBuilder()
			->select( [ 'up_user' ] )
			->from( 'user_properties' )
			->where( [
				'up_property' => 'sdms-specialsearch-default',
				'up_value' => '1',
			] )
			->caller( __METHOD__ )
			->fetchResultSet();
		if ( !$userIds ) {
			return;
		}
		$insertRows = [];
		$deleteUserIds = [];
		foreach ( $userIds as $userId ) {
			$userId = (int)$userId;
			$insertRows[] = [
				'up_user' => $userId,
				'up_property' => 'search-special-page',
				'up_value' => 'Search',
			];
			$deleteUserIds[] = $userId;
		}

		$dbw = $this->getPrimaryDB();
		$this->beginTransaction( $dbw, __METHOD__ );
		$dbw->newInsertQueryBuilder()
			->insertInto( 'user_properties' )
			->rows( $insertRows )
			->caller( __METHOD__ )
			->execute();
		$dbw->newDeleteQueryBuilder()
			->deleteFrom( 'user_properties' )
			->where( [
				'up_user' => $deleteUserIds,
				'up_property' => 'sdms-specialsearch-default',
			] )
			->caller( __METHOD__ )
			->execute();
		$this->commitTransaction( $dbw, __METHOD__ );
	}
}

$maintClass = MigrateSearchPagePrefs::class;
require_once RUN_MAINTENANCE_IF_MAIN;
