<?php

namespace MediaWiki\Extension\MediaSearch\Tests\MediaWiki;

use HashConfig;
use InvalidArgumentException;
use MediaWiki\Extension\MediaSearch\SearchOptions;
use MediaWikiIntegrationTestCase;
use MockMessageLocalizer;

/**
 * @covers \MediaWiki\Extension\MediaSearch\SearchOptions
 */
class SearchOptionsTest extends MediaWikiIntegrationTestCase {
	public function assertIsValidConfigArray( array $data ) {
		$this->assertIsArray( $data );

		if ( isset( $data['items'] ) ) {
			foreach ( $data['items'] as $entry ) {
				$this->assertArrayHasKey( 'label', $entry );
				$this->assertArrayHasKey( 'value', $entry );
			}
		}
	}

	public function testGetImageSizesForValidTypes() {
		$options = new SearchOptions(
			new MockMessageLocalizer(),
			new HashConfig(),
			new HashConfig()
		);

		// verify that all valid types have a valid sizes return value
		foreach ( SearchOptions::ALL_TYPES as $type ) {
			$sizes = $options->getImageSizes( $type );
			$this->assertIsValidConfigArray( $sizes );
		}
	}

	public function testGetImageSizesForImage() {
		$options = new SearchOptions(
			new MockMessageLocalizer(),
			new HashConfig(),
			new HashConfig()
		);

		// verify that there are image sizes for image
		$sizes = $options->getImageSizes( SearchOptions::TYPE_IMAGE );
		$this->assertNotEmpty( $sizes );
	}

	public function testGetImageSizesForPage() {
		$options = new SearchOptions(
			new MockMessageLocalizer(),
			new HashConfig(),
			new HashConfig()
		);

		// verify that there are no image sizes for page
		$sizes = $options->getImageSizes( SearchOptions::TYPE_PAGE );
		$this->assertEmpty( $sizes );
	}

	public function testGetImageSizesForInvalidTypesThrows() {
		$options = new SearchOptions(
			new MockMessageLocalizer(),
			new HashConfig(),
			new HashConfig()
		);

		// verify that invalid types throw an exception
		$this->expectException( InvalidArgumentException::class );
		$options->getImageSizes( 'i-am-an-invalid-type' );
	}

	public function testGetMimeTypesForValidTypes() {
		$options = new SearchOptions(
			new MockMessageLocalizer(),
			new HashConfig(),
			new HashConfig()
		);

		// verify that all valid types have a valid mime type return value
		foreach ( SearchOptions::ALL_TYPES as $type ) {
			$mimes = $options->getMimeTypes( $type );
			$this->assertIsValidConfigArray( $mimes );
		}
	}

	public function testGetMimeTypesForImage() {
		$options = new SearchOptions(
			new MockMessageLocalizer(),
			new HashConfig(),
			new HashConfig()
		);

		// verify that there are mime types for image
		$mimes = $options->getMimeTypes( SearchOptions::TYPE_IMAGE );
		$this->assertNotEmpty( $mimes );
	}

	public function testGetMimeTypesForPage() {
		$options = new SearchOptions(
			new MockMessageLocalizer(),
			new HashConfig(),
			new HashConfig()
		);

		// verify that there are no mime types for page
		$mimes = $options->getMimeTypes( SearchOptions::TYPE_PAGE );
		$this->assertEmpty( $mimes );
	}

	public function testGetMimeTypesForInvalidTypesThrows() {
		$options = new SearchOptions(
			new MockMessageLocalizer(),
			new HashConfig(),
			new HashConfig()
		);

		// verify that invalid types throw an exception
		$this->expectException( InvalidArgumentException::class );
		$options->getMimeTypes( 'i-am-an-invalid-type' );
	}

	public function testGetSortsForValidTypes() {
		$options = new SearchOptions(
			new MockMessageLocalizer(),
			new HashConfig(),
			new HashConfig()
		);

		// verify that all valid types have a valid sorts return value
		foreach ( SearchOptions::ALL_TYPES as $type ) {
			$sorts = $options->getSorts( $type );
			$this->assertIsValidConfigArray( $sorts );
		}
	}

	public function testGetSortsForInvalidTypesThrows() {
		$options = new SearchOptions(
			new MockMessageLocalizer(),
			new HashConfig(),
			new HashConfig()
		);

		// verify that invalid types throw an exception
		$this->expectException( InvalidArgumentException::class );
		$options->getSorts( 'i-am-an-invalid-type' );
	}

	public function testGetLicenseGroupsForValidTypes() {
		$licenseMapping = [
			'attribution' => [ 'P275=Q98755364', 'P275=Q98755344' ],
			'attribution-same-license' => [ 'P275=Q19125117' ],
			'unrestricted' => [],
		];

		$options = new SearchOptions(
			new MockMessageLocalizer(),
			new HashConfig(),
			new HashConfig( [ 'LicenseMapping' => $licenseMapping ] )
		);

		// verify that all valid types have a valid licenses return value
		foreach ( SearchOptions::ALL_TYPES as $type ) {
			$licenses = $options->getLicenseGroups( $type );
			$this->assertIsValidConfigArray( $licenses );

			if ( isset( $licenses['items'] ) && count( $licenses['items'] ) > 0 ) {
				// assert that the license map contains all configured licenses,
				// plus "" (= all) & "other"
				$expectedLicenses = array_merge(
					array_keys( $licenseMapping ),
					[ '', 'other' ]
				);
				$this->assertCount( count( $expectedLicenses ), $licenses['items'] );
				foreach ( $licenses['items'] as $license ) {
					$this->assertContains( $license['value'], $expectedLicenses );
				}
			}
		}
	}

	public function testGetLicenseGroupsForImage() {
		$licenseMapping = [
			'attribution' => [ 'P275=Q98755364', 'P275=Q98755344' ],
			'attribution-same-license' => [ 'P275=Q19125117' ],
			'unrestricted' => [],
		];

		$options = new SearchOptions(
			new MockMessageLocalizer(),
			new HashConfig(),
			new HashConfig( [ 'LicenseMapping' => $licenseMapping ] )
		);

		// verify that there are licenses for image
		$licenses = $options->getLicenseGroups( SearchOptions::TYPE_IMAGE );
		$this->assertNotEmpty( $licenses );
	}

	public function testGetLicenseGroupsForPage() {
		$licenseMapping = [
			'attribution' => [ 'P275=Q98755364', 'P275=Q98755344' ],
			'attribution-same-license' => [ 'P275=Q19125117' ],
			'unrestricted' => [],
		];

		$options = new SearchOptions(
			new MockMessageLocalizer(),
			new HashConfig(),
			new HashConfig( [ 'LicenseMapping' => $licenseMapping ] )
		);

		// verify that there are no licenses for page
		$licenses = $options->getLicenseGroups( SearchOptions::TYPE_PAGE );
		$this->assertEmpty( $licenses );
	}

	public function testGetLicenseGroupsForInvalidTypesThrows() {
		$options = new SearchOptions(
			new MockMessageLocalizer(),
			new HashConfig(),
			new HashConfig()
		);

		// verify that invalid types throw an exception
		$this->expectException( InvalidArgumentException::class );
		$options->getLicenseGroups( 'i-am-an-invalid-type' );
	}

	public function testGetNamespacesForValidTypes() {
		$options = new SearchOptions(
			new MockMessageLocalizer(),
			new HashConfig(),
			new HashConfig()
		);

		// verify that all valid types have a valid namespace return value
		foreach ( SearchOptions::ALL_TYPES as $type ) {
			$namespaceData = $options->getNamespaces( $type );
			$this->assertIsValidConfigArray( $namespaceData );
		}
	}

	public function testGetNamespacesForImage() {
		$options = new SearchOptions(
			new MockMessageLocalizer(),
			new HashConfig(),
			new HashConfig()
		);

		// verify that there are no namespaces for image
		$namespaceData = $options->getNamespaces( SearchOptions::TYPE_IMAGE );
		$this->assertEmpty( $namespaceData );
	}

	public function testGetNamespacesForPage() {
		$options = new SearchOptions(
			new MockMessageLocalizer(),
			new HashConfig(),
			new HashConfig()
		);

		// verify that there are namespaces for page
		$namespaceData = $options->getNamespaces( SearchOptions::TYPE_PAGE );

		$this->assertNotEmpty( $namespaceData );

		// verify that there is extra data for this filter
		$this->assertNotEmpty( $namespaceData['data'] );
	}

	public function testGetNamespacesForInvalidTypesThrows() {
		$options = new SearchOptions(
			new MockMessageLocalizer(),
			new HashConfig(),
			new HashConfig()
		);

		// verify that invalid types throw an exception
		$this->expectException( InvalidArgumentException::class );
		$options->getNamespaces( 'i-am-an-invalid-type' );
	}

	public function testGetAssessmentsForImage() {
		$assessmentFilters = [
			'featured-image' => 'P6731=Q63348049',
			'quality-image' => 'P6731=Q63348069',
			'valued-image' => 'P6731=Q63348040',
			'picture-of-the-day' => 'P6731=Q6998859',
		];

		$options = new SearchOptions(
			new MockMessageLocalizer(),
			new HashConfig( [
				'MediaSearchAssessmentFilters' => $assessmentFilters,
				'MediaSearchAssessmentQuickviewLabels' => null
			] ),
			new HashConfig()
		);

		// Verify that there are assessment filter options for image
		$assessmentOptions = $options->getAssessments( SearchOptions::TYPE_IMAGE )[ 'items' ];
		$this->assertNotEmpty( $assessmentOptions );

		// Verify that the correct number of options are created
		$expectedValues = array_merge( array_keys( $assessmentFilters ), [ '' ] );
		$this->assertCount( count( $assessmentOptions ), $expectedValues );

		// Verify that the option values correspond to the config keys
		foreach ( $assessmentOptions as $option ) {
			$this->assertContains( $option['value'], $expectedValues );
		}
	}

	public function testGetAssessmentsForPage() {
		$assessmentFilters = [
			'featured-image' => 'P6731=Q63348049',
			'quality-image' => 'P6731=Q63348069',
			'valued-image' => 'P6731=Q63348040',
			'picture-of-the-day' => 'P6731=Q6998859',
		];

		$options = new SearchOptions(
			new MockMessageLocalizer(),
			new HashConfig( [
				'MediaSearchAssessmentFilters' => $assessmentFilters,
				'MediaSearchAssessmentQuickviewLabels' => null
			] ),
			new HashConfig()
		);

		// Verify that there are not assessment filter options for page
		$assessmentOptions = $options->getAssessments( SearchOptions::TYPE_PAGE );
		$this->assertEmpty( $assessmentOptions );
	}
}
