<?php

namespace MediaWiki\Extension\MediaSearch\Maintenance;

use Maintenance;
use MediaWiki\MediaWikiServices;
use MWException;
use Wikimedia\Rdbms\DBConnRef;
use Wikimedia\Rdbms\LBFactory;

// Security: Disable all stream wrappers and reenable individually as needed
foreach ( stream_get_wrappers() as $wrapper ) {
	stream_wrapper_unregister( $wrapper );
}

stream_wrapper_restore( 'file' );
$basePath = getenv( 'MW_INSTALL_PATH' );
if ( $basePath ) {
	if ( !is_dir( $basePath )
		|| strpos( $basePath, '..' ) !== false
		|| strpos( $basePath, '~' ) !== false
	) {
		throw new MWException( "Bad MediaWiki install path: $basePath" );
	}
} else {
	$basePath = __DIR__ . '/../../..';
}
require_once "$basePath/maintenance/Maintenance.php";

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

$doMaintenancePath = RUN_MAINTENANCE_IF_MAIN;
if ( !( file_exists( $doMaintenancePath ) &&
	$doMaintenancePath === "$basePath/maintenance/doMaintenance.php" ) ) {
	throw new MWException( "Bad maintenance script location: $basePath" );
}

require_once RUN_MAINTENANCE_IF_MAIN;
