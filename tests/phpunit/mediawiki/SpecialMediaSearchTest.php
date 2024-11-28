<?php

namespace MediaWiki\Extension\MediaSearch\Tests\MediaWiki;

use MediaWiki\Request\FauxRequest;
use SpecialPageTestBase;

/**
 * @covers \MediaWiki\Extension\MediaSearch\Special\SpecialMediaSearch
 * @group Database
 */
class SpecialMediaSearchTest extends SpecialPageTestBase {

	protected function setUp(): void {
		parent::setUp();
		$this->setUserLang( 'qqx' );
	}

	/**
	 * @dataProvider provideExecute
	 */
	public function testExecute( $extraParams ) {
		$params = [ 'title' => 'Special:MediaSearch' ];

		foreach ( $extraParams as $param => $value ) {
			$params[$param] = $value;
		}

		$request = new FauxRequest( $params );
		$request->setRequestURL( '/test/index.php' );

		// If the special page executes without raising
		// an exception that is sufficient for this test
		$this->executeSpecialPage( '', $request );
		$this->addToAssertionCount( 1 );
	}

	public static function provideExecute() {
		return [
			'Simple invalid param value' => [
				[ 'search' => 'test', 'continue' => 'invalidvalue', ]
			],
		];
	}

	protected function newSpecialPage() {
		return $this->getServiceContainer()->getSpecialPageFactory()->getPage( 'MediaSearch' );
	}

}
