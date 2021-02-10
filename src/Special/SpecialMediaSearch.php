<?php

namespace MediaWiki\Extension\MediaSearch\Special;

use ApiBase;
use ApiMain;
use DerivativeContext;
use ExtensionRegistry;
use FauxRequest;
use MediaWiki\Extension\MediaSearch\MustacheDomTemplateParser;
use NamespaceInfo;
use OutputPage;
use RequestContext;
use SiteStats;
use TemplateParser;
use Title;
use UnlistedSpecialPage;
use Wikimedia\Assert\Assert;

/**
 * Special page specifically for searching multimedia pages.
 */
class SpecialMediaSearch extends UnlistedSpecialPage {
	/**
	 * @var NamespaceInfo
	 */
	protected $namespaceInfo;

	/**
	 * @var ApiBase
	 */
	protected $api;

	/**
	 * @var TemplateParser
	 */
	protected $templateParser;

	/**
	 * @inheritDoc
	 */
	public function __construct(
		NamespaceInfo $namespaceInfo,
		$name = 'NewMediaSearch',
		ApiBase $api = null,
		TemplateParser $templateParser = null
	) {
		parent::__construct( $name );

		$this->namespaceInfo = $namespaceInfo;
		$this->api = $api ?: new ApiMain( new FauxRequest() );
		$this->templateParser = $templateParser ?: new MustacheDomTemplateParser(
			__DIR__ . '/../../templates'
		);
	}

	/**
	 * @inheritDoc
	 */
	public function getDescription() {
		return $this->msg( 'mediasearch-title' )->parse();
	}

	/**
	 * @inheritDoc
	 */
	public function execute( $subPage ) {
		OutputPage::setupOOUI();

		// url & querystring params of this page
		$url = $this->getContext()->getRequest()->getRequestURL();
		parse_str( parse_url( $url, PHP_URL_QUERY ), $querystring );

		$term = str_replace( "\n", " ", $this->getRequest()->getText( 'q' ) );
		$activeFilters = $this->getActiveFilters( $querystring );

		$type = $querystring['type'] ?? 'bitmap';
		$filtersForDisplay = $this->getFiltersForDisplay( $activeFilters, $type );
		$limit = $this->getRequest()->getText( 'limit' ) ? (int)$this->getRequest()->getText( 'limit' ) : 40;
		$termWithFilters = $this->getTermWithFilters( $term, $activeFilters );
		$clearFiltersUrl = $this->getPageTitle()->getLinkURL( array_diff( $querystring, $activeFilters ) );

		list( $results, $continue ) = $this->search(
			$termWithFilters,
			$type,
			$limit,
			$this->getRequest()->getText( 'continue' ),
			$this->getSort( $activeFilters )
		);

		$totalSiteImages = $this->getContext()->getLanguage()->formatNum( SiteStats::images() );
		$thumbLimits = $this->getThumbLimits();

		$data = [
			'querystring' => array_map( function ( $key, $value ) {
				return [
					'key' => $key,
					'value' => $value,
					'is' . ucfirst( $key ) => true,
				];
			}, array_keys( $querystring ), array_values( $querystring ) ),
			'page' => $url,
			'path' => parse_url( $url, PHP_URL_PATH ),
			'term' => $term,
			'hasTerm' => (bool)$term,
			'limit' => $limit,
			'activeType' => $type,
			'tabs' => [
				[
					'type' => 'bitmap',
					'label' => $this->msg( 'mediasearch-tab-bitmap' )->text(),
					'isActive' => $type === 'bitmap',
					'isBitmap' => true,
				],
				[
					'type' => 'audio',
					'label' => $this->msg( 'mediasearch-tab-audio' )->text(),
					'isActive' => $type === 'audio',
					'isAudio' => true,
				],
				[
					'type' => 'video',
					'label' => $this->msg( 'mediasearch-tab-video' )->text(),
					'isActive' => $type === 'video',
					'isVideo' => true,
				],
				[
					'type' => 'page',
					'label' => $this->msg( 'mediasearch-tab-page' )->text(),
					'isActive' => $type === 'page',
					'isPage' => true,
				],
				[
					'type' => 'other',
					'label' => $this->msg( 'mediasearch-tab-other' )->text(),
					'isActive' => $type === 'other',
					'isOther' => true,
				],
			],
			'results' => array_map( function ( $result ) use ( $thumbLimits ) {
				$title = Title::newFromDBkey( $result['title'] );
				$filename = $title ? $title->getText() : $result['title'];
				$result += [ 'name' => $filename ];

				if ( array_key_exists( 'categoryinfo', $result ) ) {
					$categoryInfoParams = [
						$result['categoryinfo']['size'],
						$result['categoryinfo']['subcats'],
						$result['categoryinfo']['files']
					];
					$result += [
						'categoryInfoText' => $this->msg(
							'mediasearch-category-info',
							$categoryInfoParams
						)->parse()
					];
				}

				if ( isset( $result['imageinfo'][0]['thumburl'] ) ) {
					$imageInfo = $result['imageinfo'][0];
					$oldWidth = $imageInfo['thumbwidth'];
					$newWidth = $oldWidth;

					// find the closest (larger) width that is more common, it is (much) more
					// likely to have a thumbnail cached
					foreach ( $thumbLimits as $commonWidth ) {
						if ( $commonWidth >= $oldWidth ) {
							$newWidth = $commonWidth;
							break;
						}
					}

					$imageInfo['thumburl'] = str_replace(
						'/' . $oldWidth . 'px-',
						'/' . $newWidth . 'px-',
						$imageInfo['thumburl']
					);

					$result['imageResultClass'] = 'sdms-image-result';
					if (
						$imageInfo['thumbwidth'] && $imageInfo['thumbheight'] &&
						is_numeric( $imageInfo['thumbwidth'] ) && is_numeric( $imageInfo['thumbheight'] ) &&
						$imageInfo['thumbheight'] > 0
					) {
						if ( $imageInfo['thumbwidth'] / $imageInfo['thumbheight'] < 1 ) {
							$result['imageResultClass'] .= ' sdms-image-result--portrait';
						}

						// Generate style attribute for image wrapper.
						$displayWidth = $imageInfo['thumbwidth'];
						if ( $imageInfo['thumbheight'] < 180 ) {
							// For small images, set the wrapper width to the
							// thumbnail width plus a little extra to simulate
							// left/right padding.
							$displayWidth += 60;
						}
						// Set max initial width of 350px.
						$result['wrapperStyle'] = 'width: ' . min( [ $imageInfo['thumbwidth'], 350 ] ) . 'px;';
					}

					// Generate style attribute for the image itself.
					// There are height and max-width rules with the important
					// keyword for .content a > img in Minerva Neue, and they
					// have to be overridden.
					if ( $imageInfo['width'] && $imageInfo['height'] ) {
						$result['imageStyle'] =
						'height: 100% !important; ' .
						'max-width: ' . $imageInfo['width'] . 'px !important; ' .
						'max-height: ' . $imageInfo['height'] . 'px;';
					}
				}

				return $result;
			}, $results ),
			'continue' => $continue,
			'hasFilters' => count( $activeFilters ) > 0,
			'activeFilters' => array_values( $activeFilters ),
			'filtersForDisplay' => array_values( $filtersForDisplay ),
			'clearFiltersUrl' => $clearFiltersUrl,
			'clearFiltersText' => $this->msg( 'mediasearch-clear-filters' )->text(),
			'hasMore' => $continue !== null,
			'endOfResults' => count( $results ) > 0 && $continue === null,
			'endOfResultsMessage' => $this->msg( 'mediasearch-end-of-results' )->text(),
			// phpcs:ignore Generic.Files.LineLength.TooLong
			'endOfResultsMessageExtra' => $this->msg( 'mediasearch-end-of-results-tips' )->text(),
			'searchLabel' => $this->msg( 'mediasearch-input-label' )->text(),
			'searchButton' => $this->msg( 'searchbutton' )->text(),
			'searchPlaceholder' => $this->msg( 'mediasearch-input-placeholder' )->text(),
			'continueMessage' => $this->msg( 'mediasearch-load-more-results' )->text(),
			'emptyMessage' => $this->msg( 'mediasearch-empty-state', $totalSiteImages )
				->text(),
			'noResultsMessage' => $this->msg( 'mediasearch-no-results' )->text(),
			'noResultsMessageExtra' => $this->msg( 'mediasearch-no-results-tips' )->text(),
		];

		$this->getOutput()->addHTML( $this->templateParser->processTemplate( 'SERPWidget', $data ) );
		$this->getOutput()->addModuleStyles( [ 'mediasearch.styles' ] );
		$this->getOutput()->addModules( [ 'mediasearch' ] );
		$this->getOutput()->addJsConfigVars( [
			'sdmsInitialSearchResults' => $data,
			'sdmsTotalSiteImages' => $totalSiteImages,
			'sdmsExternalEntitySearchBaseUri' => $this->getConfig()->get( 'MediaSearchExternalEntitySearchBaseUri' ),
			'sdmsThumbLimits' => $thumbLimits,
			'sdmsLocalDev' => $this->getConfig()->get( 'MediaSearchLocalDev' ),
			'sdmsInitialFilters' => json_encode( (object)$activeFilters ),
			'sdmsEnableLicenseFilter' => ExtensionRegistry::getInstance()->isLoaded( 'WikibaseCirrusSearch' )
		] );

		$this->addHelpLink( 'Help:MediaSearch' );

		return parent::execute( $subPage );
	}

	/**
	 * @param string $term
	 * @param string|null $type
	 * @param int|null $limit
	 * @param string|null $continue
	 * @param string|null $sort
	 * @return array [ search results, continuation value ]
	 * @throws \MWException
	 */
	protected function search(
		$term, $type = null,
		$limit = null,
		$continue = null,
		$sort = 'relevance'
	): array {
		Assert::parameterType( 'string', $term, '$term' );
		Assert::parameterType( 'string|null', $type, '$type' );
		Assert::parameterType( 'integer|null', $limit, '$limit' );
		Assert::parameterType( 'string|null', $continue, '$continue' );
		Assert::parameterType( 'string|null', $sort, '$sort' );

		if ( $term === '' ) {
			return [ [], null ];
		}

		$langCode = $this->getContext()->getLanguage()->getCode();

		if ( $type === 'page' ) {
			$namespaces = array_diff( $this->namespaceInfo->getValidNamespaces(), [ NS_FILE ] );
			$request = new FauxRequest( [
				'format' => 'json',
				'uselang' => $langCode,
				'action' => 'query',
				'generator' => 'search',
				'gsrsearch' => $term,
				'gsrnamespace' => implode( '|', $namespaces ),
				'gsrlimit' => $limit,
				'gsroffset' => $continue ?: 0,
				'gsrsort' => $sort,
				'prop' => 'info|categoryinfo',
				'inprop' => 'url',
			] );
		} else {
			$filetype = $type;
			if ( $type === 'bitmap' ) {
				$filetype .= '|drawing';
			}
			if ( $type === 'other' ) {
				$filetype = 'multimedia|office|archive|3d';
			}

			switch ( $type ) {
				case 'video':
					$width = 200;
					break;

				case 'other':
					$width = 120;
					break;

				default:
					$width = null;
			}

			$request = new FauxRequest( [
				'format' => 'json',
				'uselang' => $langCode,
				'action' => 'query',
				'generator' => 'search',
				'gsrsearch' => ( $filetype ? "filetype:$filetype " : '' ) . $term,
				'gsrnamespace' => NS_FILE,
				'gsrlimit' => $limit,
				'gsroffset' => $continue ?: 0,
				'gsrsort' => $sort,
				'prop' => 'info|imageinfo|entityterms',
				'inprop' => 'url',
				'iiprop' => 'url|size|mime',
				'iiurlheight' => $type === 'bitmap' ? 180 : null,
				'iiurlwidth' => $width,
				'wbetterms' => 'label',
			] );
		}

		if ( $this->getConfig()->get( 'MediaSearchLocalDev' ) ) {
			// Pull data from Commons: for use in testing
			$url = 'https://commons.wikimedia.org/w/api.php?' . http_build_query( $request->getQueryValues() );
			$request = \MediaWiki\MediaWikiServices::getInstance()->getHttpRequestFactory()
				->create( $url, [], __METHOD__ );
			$request->execute();
			$data = $request->getContent();
			$response = json_decode( $data, true ) ?: [];
		} else {
			// Local results (real)
			$context = new DerivativeContext( RequestContext::getMain() );
			$context->setRequest( $request );
			$this->api->setContext( $context );
			$this->api->execute();
			$response = $this->api->getResult()->getResultData( [], [ 'Strip' => 'all' ] );
		}

		$results = array_values( $response['query']['pages'] ?? [] );
		$continue = $response['continue']['gsroffset'] ?? null;

		uasort( $results, function ( $a, $b ) {
			return $a['index'] <=> $b['index'];
		} );

		return [ $results, $continue ];
	}

	/**
	 * @param array $queryParams
	 * @return array
	 */
	protected function getActiveFilters( $queryParams ) : array {
		$enabledParams = $this->getConfig()->get( 'MediaSearchSupportedFilterParams' );

		if ( $enabledParams ) {
			return array_intersect_key(
				$queryParams,
				array_flip( $enabledParams )
			);
		} else {
			return [];
		}
	}

	/**
	 * We need to see if the values for each active filter as specified by URL
	 * params match any of the pre-defined possible values for a given filter
	 * type. For example, an imageSize setting determined by url params like
	 * &imageSize=500,1000 should be presented to the user as "Medium".
	 *
	 * @todo There is probably a cleaner way to do this in PHP than this ugly
	 * nested for loop...
	 *
	 * @param array $activeFilters
	 * @param string $mediaType
	 * @return array
	 */
	protected function getFiltersForDisplay( $activeFilters, $mediaType ) : array {
		$display = [];
		$allFilters = file_get_contents( __DIR__ . '/../../resources/data/filterItems.json' );
		$allSorts = file_get_contents( __DIR__ . '/../../resources/data/sortFilterItems.json' );
		$filterData = json_decode( $allFilters, true );
		$sortData = json_decode( $allSorts, true );

		// Sort options are handled differently from filters. Possible values
		// will be defined by the relevant JSON file, but they will always live
		// under the "sort" key and will not be specific to a particular media
		// type. Manually adding a "sort" key with the values from the JSON file
		// to the current media type's set of potential filters seemed like one
		// way to handle this.
		$filterData[ $mediaType ][ 'sort' ] = $sortData;

		foreach ( $filterData[ $mediaType ] as $filterType => $possibleValues ) {
			if ( array_key_exists( $filterType, $activeFilters ) ) {
				foreach ( $possibleValues as $item ) {
					if ( $activeFilters[ $filterType ] === $item[ 'value' ] ) {
						$display[ $filterType ] = array_key_exists( 'labelMessage', $item ) ?
							$this->msg( $item[ 'labelMessage' ] )->text() :
							$item[ 'label' ];
					}
				}
			}
		}

		return $display;
	}

	/**
	 * Prepare a string of original search term plus additional filter or sort
	 * parameters, suitable to be passed to the API. If no valid filters are
	 * provided, the original term is returned.
	 *
	 * @param string $term
	 * @param array $filters [ "mimeType" => "tiff", "imageSize" => ">500" ]
	 * @return string "kittens filemime:tiff fileres:>500"
	 */
	protected function getTermWithFilters( $term, $filters ) : string {
		if ( empty( $term ) || empty( $filters ) ) {
			return $term;
		}

		$withFilters = $term;

		foreach ( $filters as $key => $value ) {
			if ( $key === 'mimeType' ) {
				$withFilters = "filemime:$value " . $withFilters;
			}

			if ( $key === 'imageSize' ) {
				$withFilters = "fileres:$value " . $withFilters;
			}

			if ( $key === 'license' ) {
				$withFilters = "haslicense:$value " . $withFilters;
			}
		}

		return $withFilters;
	}

	/**
	 * Determine what the API sort value should be
	 *
	 * @param array $activeFilters
	 * @return string
	 */
	protected function getSort( $activeFilters ) : string {
		if ( array_key_exists( 'sort', $activeFilters ) && $activeFilters[ 'sort' ] === 'recency' ) {
			return 'create_timestamp_desc';
		} else {
			return 'relevance';
		}
	}

	/**
	 * Gather a list of thumbnail widths that are frequently requested & are
	 * likely to be warm in that; this is the configured thumnail limits, and
	 * their responsive 1.5x & 2x versions.
	 *
	 * @return array
	 */
	protected function getThumbLimits() {
		$thumbLimits = [];
		foreach ( $this->getConfig()->get( 'ThumbLimits' ) as $limit ) {
			$thumbLimits[] = $limit;
			$thumbLimits[] = $limit * 1.5;
			$thumbLimits[] = $limit * 2;
		}
		$thumbLimits = array_map( 'intval', $thumbLimits );
		$thumbLimits = array_unique( $thumbLimits );
		sort( $thumbLimits );
		return $thumbLimits;
	}
}
