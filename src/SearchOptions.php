<?php

namespace MediaWiki\Extension\MediaSearch;

use Config;
use InvalidArgumentException;
use MediaWiki\MediaWikiServices;
use MessageLocalizer;
use Wikibase\Search\Elastic\Query\HasLicenseFeature;

/**
 * @license GPL-2.0-or-later
 * @author Eric Gardner
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
	public const FILTER_LICENSE = 'haslicense';
	public const FILTER_SORT = 'sort';
	public const FILTER_NAMESPACE = 'namespace';

	public const ALL_FILTERS = [
		self::FILTER_MIME,
		self::FILTER_SIZE,
		self::FILTER_LICENSE,
		self::FILTER_SORT,
		self::FILTER_NAMESPACE,
	];

	public const NAMESPACES_ALL = 'all';
	public const NAMESPACES_DISCUSSION = 'discussion';
	public const NAMESPACES_HELP = 'help';
	public const NAMESPACES_CUSTOM = 'custom';

	public const NAMESPACE_GROUPS = [
		self::NAMESPACES_ALL,
		self::NAMESPACES_DISCUSSION,
		self::NAMESPACES_HELP,
		self::NAMESPACES_CUSTOM
	];

	/** @var MessageLocalizer */
	private $context;

	/** @var Config|null */
	private $searchConfig;

	/**
	 * @param MessageLocalizer $context
	 * @param Config|null $searchConfig
	 */
	public function __construct(
		MessageLocalizer $context,
		Config $searchConfig = null
	) {
		$this->context = $context;
		$this->searchConfig = $searchConfig;
	}

	/**
	 * @param MessageLocalizer $context
	 * @return SearchOptions
	 */
	public static function getInstanceFromContext( MessageLocalizer $context ) {
		try {
			$configFactory = MediaWikiServices::getInstance()->getConfigFactory();
			$searchConfig = $configFactory->makeConfig( 'WikibaseCirrusSearch' );
		} catch ( \ConfigException $e ) {
			$searchConfig = null;
		}

		return new static( $context, $searchConfig );
	}

	/**
	 * @param MessageLocalizer $context
	 * @return array
	 */
	public static function getSearchOptions( MessageLocalizer $context ) : array {
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
	public function getOptions() : array {
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
				static::FILTER_SORT => $this->getSorts( $type ),
				static::FILTER_NAMESPACE => $this->getNamespaces( $type )
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
	public function getImageSizes( string $type ) : array {
		if ( !in_array( $type, static::ALL_TYPES, true ) ) {
			throw new InvalidArgumentException( "$type is not a valid type" );
		}

		if ( $type === static::TYPE_IMAGE ) {
			return [ 'items' => [
				[
					'label' => $this->context->msg( 'mediasearch-filter-size-any' )->parse(),
					'value' => ''
				],
				[
					'label' => $this->context->msg( 'mediasearch-filter-size-small' )->parse(),
					'value' => '<500'
				],
				[
					// phpcs:ignore Generic.Files.LineLength.TooLong
					'label' => $this->context->msg( 'mediasearch-filter-size-medium' )->parse(),
					'value' => '500,1000'
				],
				[
					'label' => $this->context->msg( 'mediasearch-filter-size-large' )->parse(),
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
	public function getMimeTypes( string $type ) : array {
		if ( !in_array( $type, static::ALL_TYPES, true ) ) {
			throw new InvalidArgumentException( "$type is not a valid type" );
		}

		switch ( $type ) {
			case static::TYPE_IMAGE:
				return [ 'items' => [
					[
						// phpcs:ignore Generic.Files.LineLength.TooLong
						'label' => $this->context->msg( 'mediasearch-filter-file-type-any' )->parse(),
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
						'label' => $this->context->msg( 'mediasearch-filter-file-type-any' )->parse(),
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
						'label' => $this->context->msg( 'mediasearch-filter-file-type-any' )->parse(),
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
						'label' => $this->context->msg( 'mediasearch-filter-file-type-any' )->parse(),
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
	 * Get the sort options for each media type. Supported by all types.
	 *
	 * @param string $type
	 * @return array
	 */
	public function getSorts( string $type ) : array {
		if ( !in_array( $type, static::ALL_TYPES, true ) ) {
			throw new InvalidArgumentException( "$type is not a valid type" );
		}

		return [ 'items' => [
			[
				'label' => $this->context->msg( 'mediasearch-filter-sort-default' )->parse(),
				'value' => ''
			],
			[
				'label' => $this->context->msg( 'mediasearch-filter-sort-recency' )->parse(),
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
	public function getLicenseGroups( string $type ) : array {
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
			'label' => $this->context->msg( 'mediasearch-filter-license-any' )->parse(),
			'value' => ''
		];

		foreach ( array_keys( $licenseMappings ) as $group ) {
			$msgKey = 'mediasearch-filter-license-' . $group;

			$licenseGroups[] = [
				'label' => $this->context->msg( $msgKey )->parse(),
				'value' => $group
			];
		}

		// Add the "other" label
		$licenseGroups[] = [
			'label' => $this->context->msg( 'mediasearch-filter-license-other' )->parse(),
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
	public function getNamespaces( string $type ) : array {
		if ( !in_array( $type, static::ALL_TYPES, true ) ) {
			throw new InvalidArgumentException( "$type is not a valid type" );
		}

		if ( $type === static::TYPE_PAGE ) {
			$filterItems = [
				[
					// phpcs:ignore Generic.Files.LineLength.TooLong
					'label' => $this->context->msg( 'mediasearch-filter-namespace-all' )->parse(),
					'value' => static::NAMESPACES_ALL
				],
				[
					// phpcs:ignore Generic.Files.LineLength.TooLong
					'label' => $this->context->msg( 'mediasearch-filter-namespace-discussion' )->parse(),
					'value' => static::NAMESPACES_DISCUSSION
				],
				[
					// phpcs:ignore Generic.Files.LineLength.TooLong
					'label' => $this->context->msg( 'mediasearch-filter-namespace-help' )->parse(),
					'value' => static::NAMESPACES_HELP
				],
				[
					// phpcs:ignore Generic.Files.LineLength.TooLong
					'label' => $this->context->msg( 'mediasearch-filter-namespace-custom' )->parse(),
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
	public function getNamespaceGroups() : array {
		$namespaceInfo = MediaWikiServices::getInstance()->getNamespaceInfo();
		$allNamespaces = $namespaceInfo->getCanonicalNamespaces();

		$nonFileNamespaces = array_filter( $allNamespaces, static function ( $namespaceId ) {
			// Exclude virtual namespaces & file namespace.
			return $namespaceId >= 0 && $namespaceId !== NS_FILE;
		}, ARRAY_FILTER_USE_KEY );

		$talkNamespaces = array_combine(
			$namespaceInfo->getTalkNamespaces(),
			array_map( static function ( $namespaceId ) use ( $allNamespaces ) {
				return $allNamespaces[$namespaceId];
			}, $namespaceInfo->getTalkNamespaces() )
		);

		return [
			static::NAMESPACES_ALL => $nonFileNamespaces,
			static::NAMESPACES_DISCUSSION => $talkNamespaces,
			static::NAMESPACES_HELP => [
				NS_PROJECT => $namespaceInfo->getCanonicalName( NS_PROJECT ),
				NS_HELP => $namespaceInfo->getCanonicalName( NS_HELP ),
			]
		];
	}

	/**
	 * @param string $input
	 * @return int[]
	 * @throws InvalidArgumentException
	 */
	public function getNamespaceIdsFromInput( $input ): array {
		$namespaceGroups = $this->getNamespaceGroups();

		if ( isset( $namespaceGroups[$input] ) ) {
			// namespace is one of the predefined namespace categories
			// for which we have a list of namespace ids handy
			return array_keys( $namespaceGroups[$input] );
		}

		$inputIds = explode( '|', $input );
		$allowedIds = array_keys( $namespaceGroups[ static::NAMESPACES_ALL ] );
		$verifiedIds = array_intersect( $allowedIds, $inputIds );
		if ( count( $verifiedIds ) === count( $inputIds ) ) {
			return $verifiedIds;
		}

		throw new InvalidArgumentException( "$input is no valid namespace input" );
	}
}
