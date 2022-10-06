<?php

namespace MediaWiki\Extension\MediaSearch\Maintenance;

use Maintenance;
use MediaWiki\MediaWikiServices;
use Wikimedia\Rdbms\DBConnRef;
use Wikimedia\Rdbms\LBFactory;

$IP = getenv( 'MW_INSTALL_PATH' );
if ( $IP === false ) {
	$IP = __DIR__ . '/../../..';
}
require_once "$IP/maintenance/Maintenance.php";

/**
 * Users used to indicate that they want to use Special:Search instead of MediaSearch using the
 * preference sdms-specialsearch-default. There is now a new preference in core called
 * search-special-page, this script is to migrate the old to the new
 */
class MigrateSearchPagePrefs extends Maintenance {

	/** @var DBConnRef */
	private $dbw;

	/** @var DBConnRef */
	private $dbr;

	/** @var LBFactory */
	private $loadBalancerFactory;

	public function __construct() {
		parent::__construct();
		$this->requireExtension( 'MediaSearch' );

		$this->addDescription( 'Migrates the sdms-specialsearch-default preferenc to '
			. 'search-special-page ' );
	}

	public function init() {
		$services = MediaWikiServices::getInstance();
		$this->loadBalancerFactory = $services->getDBLoadBalancerFactory();

		$loadBalancer = $this->loadBalancerFactory->getMainLB();

		$this->dbw = $loadBalancer->getConnectionRef( DB_PRIMARY );
		$this->dbr = $loadBalancer->getConnectionRef( DB_REPLICA );
	}

	public function execute() {
		$this->init();

		$userIds = $this->dbr->selectFieldValues(
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

		$this->beginTransaction( $this->dbw, __METHOD__ );
		$this->dbw->insert(
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
		$this->dbw->delete(
			'user_properties',
			[
				'up_user' => $userIds,
				'up_property' => [ 'sdms-specialsearch-default' ],
			],
			__METHOD__
		);
		$this->commitTransaction( $this->dbw, __METHOD__ );
	}
}

$maintClass = MigrateSearchPagePrefs::class;
require_once RUN_MAINTENANCE_IF_MAIN;
