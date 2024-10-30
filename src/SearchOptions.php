<?php

namespace MediaWiki\Extension\MediaSearch;

use InvalidArgumentException;
use MediaWiki\Config\Config;
use MediaWiki\Config\ConfigException;
use MediaWiki\MediaWikiServices;
use MessageLocalizer;
use Wikibase\Search\Elastic\Query\HasLicenseFeature;

/**
 * @license GPL-2.0-or-later
 */
class SearchOptions {

	public const TYPE_IMAGE = 'image';
	public const TYPE_AUDIO = 'audio';
	public const TYPE_VIDEO = 'video';
	public const TYPE_PAGE = 'page';
	public const TYPE_OTHER = 'other';

	public const ALL_TYPES = [
		self::TYPE_IMAGE,
		self::TYPE_AUDIO,
		self::TYPE_VIDEO,
		self::TYPE_PAGE,
		self::TYPE_OTHER,
	];

	public const FILTER_MIME = 'filemime';
	public const FILTER_SIZE = 'fileres';
	public const FILTER_ASSESSMENT = 'assessment';
	public const FILTER_LICENSE = 'haslicense';
	public const FILTER_SORT = 'sort';
	public const FILTER_NAMESPACE = 'namespace';

	public const ALL_FILTERS = [
		self::FILTER_MIME,
		self::FILTER_SIZE,
		self::FILTER_ASSESSMENT,
		self::FILTER_LICENSE,
		self::FILTER_SORT,
		self::FILTER_NAMESPACE,
	];

	public const NAMESPACES_ALL = 'all';
	public const NAMESPACES_ALL_INCL_FILE = 'all_incl_file';
	public const NAMESPACES_DISCUSSION = 'discussion';
	public const NAMESPACES_HELP = 'help';
	public const NAMESPACES_CUSTOM = 'custom';

	public const NAMESPACE_GROUPS = [
		self::NAMESPACES_ALL,
		self::NAMESPACES_ALL_INCL_FILE,
		self::NAMESPACES_DISCUSSION,
		self::NAMESPACES_HELP,
		self::NAMESPACES_CUSTOM
	];

	/** @var MessageLocalizer */
	private $context;

	/** @var Config|null */
	private $mainConfig;

	/** @var Config|null */
	private $searchConfig;

	/**
	 * @param MessageLocalizer $context
	 * @param Config|null $mainConfig
	 * @param Config|null $searchConfig
	 */
	public function __construct(
		MessageLocalizer $context,
		?Config $mainConfig = null,
		?Config $searchConfig = null
	) {
		$this->context = $context;
		$this->mainConfig = $mainConfig;
		$this->searchConfig = $searchConfig;
	}

	/**
	 * @param MessageLocalizer $context
	 * @return SearchOptions
	 */
	public static function getInstanceFromContext( MessageLocalizer $context ) {
		$configFactory = MediaWikiServices::getInstance()->getConfigFactory();

		try {
			$mainConfig = $configFactory->makeConfig( 'main' );
		} catch ( ConfigException $e ) {
			$mainConfig = null;
		}

		try {
			$searchConfig = $configFactory->makeConfig( 'WikibaseCirrusSearch' );
		} catch ( ConfigException $e ) {
			$searchConfig = null;
		}

		return new static( $context, $mainConfig, $searchConfig );
	}

	/**
	 * @param MessageLocalizer $context
	 * @return array
	 */
	public static function getSearchOptions( MessageLocalizer $context ): array {
		$instance = static::getInstanceFromContext( $context );
		return $instance->getOptions();
	}

	/**
	 * Generate an associative array that combines all options for filter,
	 * sort, and licenses for all media types, with labels in the appropriate
	 * language.
	 *
	 * @return array
	 */
	public function getOptions(): array {
		$searchOptions = [];
		// Some options are only present for certain media types.
		// The methods which generate type-specific options take a mediatype
		// argument and will return false if the given type does not support the
		// options in question.

		// The $context object must be passed down to the various helper methods
		// because getSearchOptions can be called both as a ResourceLoader callback
		// as well as during SpecialMediaSearch->execute(); we need to make sure
		// the messages can be internationalized in the same way regardless
		foreach ( static::ALL_TYPES as $type ) {
			$searchOptions[ $type ] = array_filter( [
				static::FILTER_LICENSE => $this->getLicenseGroups( $type ),
				static::FILTER_MIME => $this->getMimeTypes( $type ),
				static::FILTER_SIZE => $this->getImageSizes( $type ),
				static::FILTER_ASSESSMENT => $this->getAssessments( $type ),
				static::FILTER_NAMESPACE => $this->getNamespaces( $type ),
				static::FILTER_SORT => $this->getSorts( $type )
			] );
		}

		return $searchOptions;
	}

	/**
	 * Get the size options. Only supported by "image" type.
	 *
	 * @param string $type
	 * @return array
	 * @throws InvalidArgumentException
	 */
	public function getImageSizes( string $type ): array {
		if ( !in_array( $type, static::ALL_TYPES, true ) ) {
			throw new InvalidArgumentException( "$type is not a valid type" );
		}

		if ( $type === static::TYPE_IMAGE ) {
			return [ 'items' => [
				[
					'label' => $this->context->msg( 'mediasearch-filter-size-unset' )->text(),
					'value' => ''
				],
				[
					'label' => $this->context->msg( 'mediasearch-filter-size-small' )->text(),
					'value' => '<500'
				],
				[
					// phpcs:ignore Generic.Files.LineLength.TooLong
					'label' => $this->context->msg( 'mediasearch-filter-size-medium' )->text(),
					'value' => '500,1000'
				],
				[
					'label' => $this->context->msg( 'mediasearch-filter-size-large' )->text(),
					'value' => '>1000'
				],
			] ];
		} else {
			return [];
		}
	}

	/**
	 * Get the mimetype options for a given mediatype. All types except "page"
	 * support this option.
	 *
	 * @param string $type
	 * @return array
	 */
	public function getMimeTypes( string $type ): array {
		if ( !in_array( $type, static::ALL_TYPES, true ) ) {
			throw new InvalidArgumentException( "$type is not a valid type" );
		}

		switch ( $type ) {
			case static::TYPE_IMAGE:
				return [ 'items' => [
					[
						// phpcs:ignore Generic.Files.LineLength.TooLong
						'label' => $this->context->msg( 'mediasearch-filter-file-type-unset' )->text(),
						'value' => ''
					],
					[
						'label' => 'tiff',
						'value' => 'tiff'
					],
					[
						'label' => 'png',
						'value' => 'png'
					],
					[
						'label' => 'gif',
						'value' => 'gif'
					],
					[
						'label' => 'jpg',
						'value' => 'jpeg'
					],
					[
						'label' => 'webp',
						'value' => 'webp'
					],
					[
						'label' => 'xcf',
						'value' => 'xcf'
					],
					[
						'label' => 'svg',
						'value' => 'svg'
					]
				] ];
			case static::TYPE_AUDIO:
				return [ 'items' => [
					[
						// phpcs:ignore Generic.Files.LineLength.TooLong
						'label' => $this->context->msg( 'mediasearch-filter-file-type-unset' )->text(),
						'value' => ''
					],
					[
						'label' => 'mid',
						'value' => 'midi'
					],
					[
						'label' => 'flac',
						'value' => 'flac'
					],
					[
						'label' => 'wav',
						'value' => 'wav'
					],
					[
						'label' => 'mp3',
						'value' => 'mpeg'
					],
					[
						'label' => 'ogg',
						'value' => 'ogg'
					]
				] ];
			case static::TYPE_VIDEO:
				return [ 'items' => [
					[
						// phpcs:ignore Generic.Files.LineLength.TooLong
						'label' => $this->context->msg( 'mediasearch-filter-file-type-unset' )->text(),
						'value' => ''
					],
					[
						'label' => 'webm',
						'value' => 'webm'
					],
					[
						'label' => 'mpg',
						'value' => 'mpeg'
					],
					[
						'label' => 'ogg',
						'value' => 'ogg'
					]
				] ];
			case static::TYPE_OTHER:
				return [ 'items' => [
					[
						// phpcs:ignore Generic.Files.LineLength.TooLong
						'label' => $this->context->msg( 'mediasearch-filter-file-type-unset' )->text(),
						'value' => ''
					],
					[
						'label' => 'pdf',
						'value' => 'pdf'
					],
					[
						'label' => 'djvu',
						'value' => 'djvu'
					],
					[
						'label' => 'stl',
						'value' => 'sla'
					]
				] ];
			case static::TYPE_PAGE:
			default:
				return [];
		}
	}

	/**
	 * Get the assessment options (only applicable for image and video types) based on configuration
	 *
	 * @param string $type
	 * @return array [ 'items' => [], 'data' => [] ]
	 */
	public function getAssessments( string $type ): array {
		$assessmentOptions = [];
		$assessmentData = [];

		if ( !in_array( $type, static::ALL_TYPES, true ) ) {
			throw new InvalidArgumentException( "$type is not a valid type" );
		}

		// Bail early and return empty if we can't access config vars for some reason;
		// Feature will simply not be enabled in this case
		if ( $this->mainConfig ) {
			$assessmentConfig = $this->mainConfig->get( 'MediaSearchAssessmentFilters' );
		} else {
			return [];
		}

		// If we have the appropriate config data and we are on an image or video tab,
		// build a data structure for the pre-definied assessment types and
		// labels, along with their corresponding wikidata statements
		if ( $assessmentConfig && ( $type === static::TYPE_IMAGE || $type === self::TYPE_VIDEO ) ) {
			// Start with the default label
			$assessmentOptions[] = [
				'label' => $this->context->msg( 'mediasearch-filter-assessment-unset' )->text(),
				'value' => ''
			];

			// Options/labels
			foreach ( $assessmentConfig as $key => $statement ) {
				$assessmentOptions[] = [
					// All i18n labels are assumed to be prefixed with mediasearch-filter-assessment-
					'label' => $this->context->msg( 'mediasearch-filter-assessment-' . $key )->text(),
					'value' => $key
				];
			}

			// WB statements
			foreach ( $assessmentConfig as $key => $statement ) {
				$assessmentData[] = [
					'value' => $key,
					'statement' => 'haswbstatement:' . $statement
				];
			}

			return [
				'items' => $assessmentOptions,
				'data' => [
					'statementData' => $assessmentData
				]
			];
		} else {
			return [];
		}
	}

	/**
	 * Get the sort options for each media type. Supported by all types.
	 *
	 * @param string $type
	 * @return array
	 */
	public function getSorts( string $type ): array {
		if ( !in_array( $type, static::ALL_TYPES, true ) ) {
			throw new InvalidArgumentException( "$type is not a valid type" );
		}

		return [ 'items' => [
			[
				'label' => $this->context->msg( 'mediasearch-filter-sort-default' )->text(),
				'value' => ''
			],
			[
				'label' => $this->context->msg( 'mediasearch-filter-sort-recency' )->text(),
				'value' => 'recency'
			]
		] ];
	}

	/**
	 * Parse the on-wiki license mapping page (if one exists) and return an
	 * array of arrays, structured like:
	 * [ [ 'label' => 'some-label-text', 'value' => 'cc-by' ] ]
	 * With one child array for each license group defined in the mapping.
	 *
	 * Supported by all types except "page" type.
	 *
	 * @param string $type
	 * @return array
	 */
	public function getLicenseGroups( string $type ): array {
		if ( !in_array( $type, static::ALL_TYPES, true ) ) {
			throw new InvalidArgumentException( "$type is not a valid type" );
		}

		if (
			$this->searchConfig === null ||
			!method_exists( HasLicenseFeature::class, 'getConfiguredLicenseMap' )
		) {
			// This feature requires a dependency: not installed = feature not supported
			return [];
		}

		// Category & page searches do not have license filters
		if ( $type === static::TYPE_PAGE ) {
			return [];
		}

		$licenseMappings = HasLicenseFeature::getConfiguredLicenseMap( $this->searchConfig );
		if ( !$licenseMappings ) {
			return [];
		}

		$licenseGroups = [];

		// Add the default label
		$licenseGroups[] = [
			'label' => $this->context->msg( 'mediasearch-filter-license-any' )->text(),
			'value' => ''
		];

		foreach ( array_keys( $licenseMappings ) as $group ) {
			$msgKey = 'mediasearch-filter-license-' . $group;

			$licenseGroups[] = [
				'label' => $this->context->msg( $msgKey )->text(),
				'value' => $group
			];
		}

		// Add the "other" label
		$licenseGroups[] = [
			'label' => $this->context->msg( 'mediasearch-filter-license-other' )->text(),
			'value' => 'other'
		];

		return [ 'items' => $licenseGroups ];
	}

	/**
	 * Get the namespace options. Only supported by "page" type.
	 *
	 * @param string $type
	 * @return array
	 */
	public function getNamespaces( string $type ): array {
		if ( !in_array( $type, static::ALL_TYPES, true ) ) {
			throw new InvalidArgumentException( "$type is not a valid type" );
		}

		if ( $type === static::TYPE_PAGE ) {
			$filterItems = [
				[
					// phpcs:ignore Generic.Files.LineLength.TooLong
					'label' => $this->context->msg( 'mediasearch-filter-namespace-all' )->text(),
					'value' => static::NAMESPACES_ALL
				],
				[
					// phpcs:ignore Generic.Files.LineLength.TooLong
					'label' => $this->context->msg( 'mediasearch-filter-namespace-discussion' )->text(),
					'value' => static::NAMESPACES_DISCUSSION
				],
				[
					// phpcs:ignore Generic.Files.LineLength.TooLong
					'label' => $this->context->msg( 'mediasearch-filter-namespace-help' )->text(),
					'value' => static::NAMESPACES_HELP
				],
				[
					// phpcs:ignore Generic.Files.LineLength.TooLong
					'label' => $this->context->msg( 'mediasearch-filter-namespace-custom' )->text(),
					'value' => static::NAMESPACES_CUSTOM
				],
			];

			return [
				'items' => $filterItems,
				'data' => [
					'namespaceGroups' => $this->getNamespaceGroups()
				],
			];
		} else {
			return [];
		}
	}

	/**
	 * Get namespace data for the different namespace filter groups.
	 *
	 * @return array
	 */
	public function getNamespaceGroups(): array {
		$namespaceInfo = MediaWikiServices::getInstance()->getNamespaceInfo();
		$allNamespaces = $namespaceInfo->getCanonicalNamespaces();

		// $wgNamespacesToBeSearchedDefault is an array with namespace ids as keys, and 1|0 to
		// indicate if the namespace should be searched by default
		if ( $this->mainConfig->get( 'NamespacesToBeSearchedDefault' ) ) {
			$defaultSearchNamespaces = array_filter(
				$this->mainConfig->get( 'NamespacesToBeSearchedDefault' )
			);
		} else {
			$defaultSearchNamespaces = [ 0 => 1 ];
		}

		$realNamespaces = array_filter(
			$allNamespaces,
			static function ( $namespaceId ) {
				// Exclude virtual namespaces
				return $namespaceId >= 0;
			},
			ARRAY_FILTER_USE_KEY
		);
		$nonFileNamespaces = array_filter(
			$realNamespaces,
			static function ( $namespaceId ) {
				return $namespaceId !== NS_FILE;
			},
			ARRAY_FILTER_USE_KEY
		);

		$customNamespaces = array_intersect_key( $nonFileNamespaces, $defaultSearchNamespaces );

		$talkNamespaces = array_combine(
			$namespaceInfo->getTalkNamespaces(),
			array_map( static function ( $namespaceId ) use ( $allNamespaces ) {
				return $allNamespaces[$namespaceId];
			}, $namespaceInfo->getTalkNamespaces() )
		);

		return [
			static::NAMESPACES_ALL_INCL_FILE => $realNamespaces,
			static::NAMESPACES_ALL => $nonFileNamespaces,
			static::NAMESPACES_DISCUSSION => $talkNamespaces,
			static::NAMESPACES_HELP => [
				NS_PROJECT => $namespaceInfo->getCanonicalName( NS_PROJECT ),
				NS_HELP => $namespaceInfo->getCanonicalName( NS_HELP ),
			],
			static::NAMESPACES_CUSTOM => $customNamespaces
		];
	}

	/**
	 * @param string $input
	 * @return int[]
	 * @throws InvalidNamespaceGroupException
	 */
	public function getNamespaceIdsFromInput( $input ): array {
		$namespaceGroups = $this->getNamespaceGroups();

		if ( isset( $namespaceGroups[$input] ) ) {
			// namespace is one of the predefined namespace categories
			// for which we have a list of namespace ids handy
			return array_keys( $namespaceGroups[$input] );
		}

		$inputIds = explode( '|', $input );
		$allowedIds = array_keys( $namespaceGroups[ static::NAMESPACES_ALL_INCL_FILE ] );
		$verifiedIds = array_intersect( $allowedIds, $inputIds );
		if ( count( $verifiedIds ) === count( $inputIds ) ) {
			return $verifiedIds;
		}

		throw new InvalidNamespaceGroupException( "$input is no valid namespace input" );
	}
}
