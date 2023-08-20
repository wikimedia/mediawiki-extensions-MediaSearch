<?php

namespace MediaWiki\Extension\MediaSearch\Special;

use ApiBase;
use ApiMain;
use CirrusSearch\Parser\FullTextKeywordRegistry;
use CirrusSearch\SearchConfig;
use Config;
use ConfigException;
use DerivativeContext;
use MediaWiki\Extension\MediaSearch\InvalidFiltersException;
use MediaWiki\Extension\MediaSearch\InvalidNamespaceGroupException;
use MediaWiki\Extension\MediaSearch\NoCirrusSearchException;
use MediaWiki\Extension\MediaSearch\SearchFailedException;
use MediaWiki\Extension\MediaSearch\SearchOptions;
use MediaWiki\Html\TemplateParser;
use MediaWiki\Linker\LinkRenderer;
use MediaWiki\MediaWikiServices;
use MediaWiki\Request\FauxRequest;
use MediaWiki\Title\Title;
use MediaWiki\User\UserOptionsManager;
use NamespaceInfo;
use OOUI\Tag;
use OutputPage;
use RequestContext;
use SearchEngine;
use SearchEngineFactory;
use SiteStats;
use SpecialPage;
use Wikimedia\Assert\Assert;

/**
 * Special page specifically for searching multimedia pages.
 */
class SpecialMediaSearch extends SpecialPage {
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
	 * @var SearchConfig
	 */
	protected $searchConfig;

	/**
	 * @var Config
	 */
	protected $mainConfig;

	/**
	 * @var SearchOptions
	 */
	private $searchOptions;

	/**
	 * @var UserOptionsManager
	 */
	private $userOptionsManager;

	/**
	 * @var SearchEngine
	 */
	private $searchEngine;

	/**
	 * @var LinkRenderer
	 */
	private $linkRenderer;

	/**
	 * @inheritDoc
	 */
	public function __construct(
		SearchEngineFactory $searchEngineFactory,
		NamespaceInfo $namespaceInfo,
		UserOptionsManager $userOptionsManager,
		LinkRenderer $linkRenderer,
		$name = 'MediaSearch',
		ApiBase $api = null,
		TemplateParser $templateParser = null,
		SearchConfig $searchConfig = null,
		Config $mainConfig = null
	) {
		parent::__construct( $name );

		$this->namespaceInfo = $namespaceInfo;
		$this->api = $api ?: new ApiMain( new FauxRequest() );
		$this->templateParser = $templateParser ?: new TemplateParser(
			__DIR__ . '/../../templates'
		);
		try {
			$this->searchConfig = $searchConfig ?? MediaWikiServices::getInstance()
				->getConfigFactory()
				->makeConfig( 'CirrusSearch' );
		} catch ( ConfigException $e ) {
			// CirrusSearch not installed
		}

		$this->mainConfig = $mainConfig ?? MediaWikiServices::getInstance()
			->getConfigFactory()
			->makeConfig( 'main' );

		$this->userOptionsManager = $userOptionsManager;

		$this->searchEngine = $searchEngineFactory->create();

		$this->searchOptions = SearchOptions::getInstanceFromContext( $this->getContext() );

		$this->linkRenderer = $linkRenderer;
	}

	/**
	 * @inheritDoc
	 */
	public function getDescription() {
		return $this->msg( 'mediasearch-title' )->text();
	}

	/**
	 * @return string
	 */
	protected function getGroupName() {
		return 'pages';
	}

	/**
	 * @inheritDoc
	 */
	public function execute( $subPage ) {
		OutputPage::setupOOUI();
		$userLanguage = $this->getLanguage();

		// url & querystring params of this page
		$url = $this->getRequest()->getRequestURL();

		// Discard query param keys or values that are not strings to sanitize before using
		$queryParams = array_filter( $this->getRequest()->getValues(), static function ( $v, $k ) {
			return is_string( $k ) && is_string( $v );
		}, ARRAY_FILTER_USE_BOTH );

		$term = str_replace( "\n", ' ', $this->getRequest()->getText( 'search' ) );
		$redirectUrl = $this->findExactMatchRedirectUrl( $term );
		if ( $redirectUrl !== null ) {
			$this->getOutput()->redirect( $redirectUrl );
			return;
		}
		$tabs = [];

		$tabOrder = [
			SearchOptions::TYPE_IMAGE,
			SearchOptions::TYPE_AUDIO,
			SearchOptions::TYPE_VIDEO,
			SearchOptions::TYPE_OTHER,
			SearchOptions::TYPE_PAGE
		];
		if ( $this->mainConfig->get( 'MediaSearchTabOrder' ) ) {
			$tabOrder = array_intersect(
				$this->mainConfig->get( 'MediaSearchTabOrder' ),
				$tabOrder
			);
		}

		$type = $this->getType( $term, $queryParams, $tabOrder );

		$tabDefinitions = [
			'image' => [
				'type' => SearchOptions::TYPE_IMAGE,
				'label' => $this->msg( 'mediasearch-tab-image' )->text(),
				'isActive' => $type === SearchOptions::TYPE_IMAGE,
				'isImage' => true,
			],
			'audio' => [
				'type' => SearchOptions::TYPE_AUDIO,
				'label' => $this->msg( 'mediasearch-tab-audio' )->text(),
				'isActive' => $type === SearchOptions::TYPE_AUDIO,
				'isAudio' => true,
			],
			'video' => [
				'type' => SearchOptions::TYPE_VIDEO,
				'label' => $this->msg( 'mediasearch-tab-video' )->text(),
				'isActive' => $type === SearchOptions::TYPE_VIDEO,
				'isVideo' => true,
			],
			'other' => [
				'type' => SearchOptions::TYPE_OTHER,
				'label' => $this->msg( 'mediasearch-tab-other' )->text(),
				'isActive' => $type === SearchOptions::TYPE_OTHER,
				'isOther' => true,
			],
			'page' => [
				'type' => SearchOptions::TYPE_PAGE,
				'label' => $this->msg( 'mediasearch-tab-page' )->text(),
				'isActive' => $type === SearchOptions::TYPE_PAGE,
				'isPage' => true,
			],
		];

		foreach ( $tabOrder as $tabPlace ) {
			array_push( $tabs, $tabDefinitions[ $tabPlace ] );
		}

		$limit = $this->getRequest()->getText( 'limit' ) ? (int)$this->getRequest()->getText( 'limit' ) : 40;
		$error = [];
		$results = [];
		$searchinfo = [];
		$continue = null;
		$filtersForDisplay = [];
		$activeFilters = $this->getActiveFilters( $queryParams );

		try {
			$this->assertValidFilters( $activeFilters, $type );
			$filtersForDisplay = $this->getFiltersForDisplay( $activeFilters, $type );
			$termWithFilters = $this->getTermWithFilters( $term, $activeFilters );

			// Actually perform the search. This method will throw an error if the
			// user enters a bad query (illegal characters, etc)
			list( $results, $searchinfo, $continue ) = $this->search(
				$termWithFilters,
				$type,
				$this->getSearchNamespaces( $activeFilters, $type ),
				$limit,
				$this->getRequest()->getText( 'continue' ),
				$this->getSort( $activeFilters )
			);
		} catch (
			InvalidNamespaceGroupException | InvalidFiltersException |
			NoCirrusSearchException | SearchFailedException $_
		) {
			$error = [
				'title' => $this->msg( 'mediasearch-error-message' )->text(),
				'text' => $this->msg( 'mediasearch-error-text' )->text(),
			];
		}

		$totalSiteImages = $userLanguage->formatNum( SiteStats::images() );
		$thumbLimits = $this->getThumbLimits();

		// Handle optional searchinfo that may be present in the API response:
		$totalHits = $searchinfo['totalhits'] ?? 0;
		$didYouMean = null;
		$didYouMeanLink = null;
		$currentResultStart = $this->getRequest()->getText( 'continue' ) ?: 0;

		if ( isset( $searchinfo[ 'suggestion' ] ) ) {
			try {
				$didYouMean = $this->extractSuggestedTerm( $searchinfo['suggestion'], $activeFilters );
				$didYouMeanLink = $this->generateDidYouMeanLink( $queryParams, $didYouMean );
			} catch ( NoCirrusSearchException $_ ) {
				// Ignore.
			}
		}

		$mappedQueryParams = array_map( static function ( $key, $value ) {
			return [
				'key' => $key,
				'value' => $value,
				'is' . ucfirst( $key ) => true,
			];
		}, array_keys( $queryParams ), array_values( $queryParams ) );

		$data = [
			'queryParams' => $mappedQueryParams,
			'page' => $url,
			'path' => parse_url( $url, PHP_URL_PATH ),
			'term' => $term,
			'hasTerm' => (bool)$term,
			'limit' => $limit,
			'activeType' => $type,
			'tabs' => $tabs,
			'error' => $error,
			'results' => array_map(
				function ( $result ) use ( $results, $type ) {
					return $this->getResultData( $result, $results, $type );
				},
				$results
			),
			'continue' => $continue,
			'hasFilters' => count( $activeFilters ) > 0,
			'activeFilters' => array_values( $activeFilters ),
			'filtersForDisplay' => array_values( $filtersForDisplay ),
			'clearFiltersUrl' => $this->getPageTitle()->getLinkURL( array_diff( $queryParams, $activeFilters ) ),
			'clearFiltersText' => $this->msg( 'mediasearch-clear-filters' )->text(),
			'hasLess' => $currentResultStart > 0,
			'previousStart' => max( $currentResultStart - $limit, 0 ),
			'hasMore' => $continue !== null,
			'endOfResults' => count( $results ) > 0 && $continue === null,
			'endOfResultsMessage' => $this->msg( 'mediasearch-end-of-results' )->text(),
			'errorTitle' => $this->msg( 'mediasearch-error-message' )->text(),
			'errorText' => $this->msg( 'mediasearch-error-text' )->text(),
			'searchLabel' => $this->msg( 'mediasearch-input-label' )->text(),
			'searchButton' => $this->msg( 'searchbutton' )->text(),
			'searchPlaceholder' => $this->msg( 'mediasearch-input-placeholder' )->text(),
			'continueMessage' => $this->msg( 'mediasearch-load-more-results' )->text(),
			'previousMessage' => $this->msg( 'mediasearch-load-less-results' )->text(),
			'emptyMessage' => $this->msg( 'mediasearch-empty-state', $totalSiteImages )
				->text(),
			'noResultsMessage' => $this->msg( 'mediasearch-no-results' )->text(),
			'noResultsMessageExtra' => $this->msg( 'mediasearch-no-results-tips' )->text(),
			'didYouMean' => $didYouMean,
			// phpcs:ignore Generic.Files.LineLength.TooLong
			'didYouMeanMessage' => $didYouMean ? $this->msg( 'mediasearch-did-you-mean' )->rawParams( $didYouMeanLink )->parse() : null,
			'totalHits' => $totalHits,
			'showResultsCount' => $totalHits > 0,
			'resultsCount' => $this->msg(
				'mediasearch-results-count',
				$userLanguage->formatNum( $totalHits )
			)->text(),
			'autofocus' => !$term
		];

		$externalEntitySearchBaseUri = $this->getConfig()->get( 'MediaSearchExternalEntitySearchBaseUri' );
		if ( $externalEntitySearchBaseUri === '' ) {
			// fall back to local uri if blank
			// (but not in other `false` cases, which deactivate autocomplete)
			$externalEntitySearchBaseUri = wfScript( 'api' );
		}

		$this->getOutput()->addHTML( $this->templateParser->processTemplate( 'SERPWidget', $data ) );
		$this->getOutput()->addModuleStyles( [ 'codex-styles', 'mediasearch.styles' ] );
		$this->getOutput()->addModules( [ 'mediasearch' ] );
		$this->getOutput()->addJsConfigVars( [
			'sdmsInitialSearchResults' => $data,
			'sdmsTotalSiteImages' => $totalSiteImages,
			'sdmsExternalEntitySearchBaseUri' => $externalEntitySearchBaseUri,
			'sdmsExternalSearchUri' => $this->getConfig()->get( 'MediaSearchExternalSearchUri' ) ?: wfScript( 'api' ),
			'sdmsThumbLimits' => $thumbLimits,
			'sdmsThumbRenderMap' => $this->getConfig()->get( 'UploadThumbnailRenderMap' ),
			'sdmsInitialFilters' => json_encode( (object)$activeFilters ),
			'sdmsDidYouMean' => $didYouMean,
			'sdmsHasError' => (bool)$error,
			'sdmsNamespaceGroups' => $this->searchOptions->getNamespaceGroups(),
			'sdmsAssessmentQuickviewLabels' => $this->getConfig()->get( 'MediaSearchAssessmentQuickviewLabels' )
		] );

		$specialSearchUrl = SpecialPage::getTitleFor( 'Search' )->getLocalURL( [ 'search' => $term ] );
		$helpUrl = 'https://www.mediawiki.org/wiki/Special:MyLanguage/Help:MediaSearch';
		$this->getOutput()->setIndicators( [
			$this->getLanguage()->pipeList( [
				( new Tag( 'a' ) )
					->setAttributes( [ 'href' => $specialSearchUrl ] )
					// phpcs:ignore Generic.Files.LineLength.TooLong
					->appendContent( $this->msg( 'mediasearch-switch-special-search' )->escaped() ),
				( new Tag( 'a' ) )
					->addClasses( [ 'mw-helplink' ] )
					->setAttributes( [ 'href' => $helpUrl, 'target' => '_blank' ] )
					->appendContent( $this->msg( 'helppage-top-gethelp' )->escaped() ),
			] )
		] );

		return parent::execute( $subPage );
	}

	/**
	 * Find an exact title match if there is one, and if we ought to redirect to it then
	 * return its url
	 *
	 * @see SpecialSearch.php
	 * @param string $term
	 * @return string|null The url to redirect to, or null if no redirect.
	 */
	private function findExactMatchRedirectUrl( $term ) {
		$request = $this->getRequest();
		if ( $request->getCheck( 'type' ) ) {
			// If type is set, then the user is searching directly on Special:MediaSearch,
			// so do not redirect (the redirect should only happen when the user searches
			// from the site-wide searchbox)
			return null;
		}
		// If the term cannot be used to create a title then there is no match
		if ( Title::newFromText( $term ) === null ) {
			return null;
		}
		// Find an exact (or very near) match
		$title = $this->searchEngine
			->getNearMatcher( $this->getConfig() )->getNearMatch( $term );
		if ( $title === null ) {
			return null;
		}
		$url = null;
		if ( !$this->getHookRunner()->onSpecialSearchGoResult( $term, $title, $url ) ) {
			return null;
		}

		if (
			// If there is a preference set to NOT redirect on exact page match
			// then return null (which prevents direction)
			!$this->redirectOnExactMatch()
			// BUT ...
			// ... ignore no-redirect preference if the exact page match is an interwiki link
			&& !$title->isExternal()
			// ... ignore no-redirect preference if the exact page match is NOT in the main
			// namespace AND there's a namespace in the search string
			&& !( $title->getNamespace() !== NS_MAIN && strpos( $term, ':' ) > 0 )
		) {
			return null;
		}

		return $url ?? $title->getFullUrlForRedirect();
	}

	private function redirectOnExactMatch() {
		if ( !$this->getConfig()->get( 'SearchMatchRedirectPreference' ) ) {
			// If the preference for whether to redirect is disabled, use the default setting
			$defaultOptions = $this->userOptionsManager->getDefaultOptions();
			return $defaultOptions['search-match-redirect'];
		} else {
			// Otherwise use the user's preference
			return $this->userOptionsManager->getOption( $this->getUser(), 'search-match-redirect' );
		}
	}

	/**
	 * Get media type.
	 *
	 * @param string $term
	 * @param array $queryParams
	 * @param array $tabOrderConfig
	 * @return string
	 */
	private function getType( string $term, array $queryParams, array $tabOrderConfig ): string {
		$title = Title::newFromText( $term );
		if ( $title !== null && !in_array( $title->getNamespace(), [ NS_FILE, NS_MAIN ] ) ) {
			return SearchOptions::TYPE_PAGE;
		}

		if ( isset( $queryParams['type'] ) && in_array( $queryParams['type'], SearchOptions::ALL_TYPES ) ) {
			// If type is specified AND matches one of the supported types, use it
			return $queryParams['type'];
		} else {
			// Otherwise, default to the first prescribed tab
			return $tabOrderConfig[0];
		}
	}

	/**
	 * @param string $term
	 * @param string $type
	 * @param int[] $namespaces
	 * @param int|null $limit
	 * @param string|null $continue
	 * @param string|null $sort
	 * @return array [ search results, searchinfo data, continuation value ]
	 * @throws SearchFailedException
	 */
	protected function search(
		$term,
		$type,
		$namespaces,
		$limit = null,
		$continue = null,
		$sort = 'relevance'
	): array {
		Assert::parameterType( 'string', $term, '$term' );
		Assert::parameterType( 'string', $type, '$type' );
		Assert::parameterType( 'integer|null', $limit, '$limit' );
		Assert::parameterType( 'string|null', $continue, '$continue' );
		Assert::parameterType( 'string|null', $sort, '$sort' );

		if ( $term === '' ) {
			return [ [], [], null ];
		}

		$langCode = $this->getLanguage()->getCode();

		if ( $type === SearchOptions::TYPE_PAGE ) {
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
				'gsrinfo' => 'totalhits|suggestion',
				'gsrprop' => 'size|wordcount|timestamp|snippet',
				'prop' => 'info|categoryinfo',
				'inprop' => 'url',
			] );
		} else {
			$filetype = $type;
			if ( $type === SearchOptions::TYPE_IMAGE ) {
				$filetype = 'bitmap|drawing';
			}
			if ( $type === SearchOptions::TYPE_OTHER ) {
				$filetype = 'multimedia|office|archive|3d';
			}

			switch ( $type ) {
				case SearchOptions::TYPE_VIDEO:
					$width = 200;
					break;

				case SearchOptions::TYPE_OTHER:
					// Generating thumbnails from many of these file types is very
					// expensive and slow, enough so that we're better off using a
					// larger (takes longer to transfer) pre-generated (but readily
					// available) size
					$width = min( $this->getThumbLimits() );
					break;

				default:
					$width = null;
			}

			// We need to filter out media result with images that have 0 height or width.
			// This break the API response.
			$fileres = '';
			if ( $type !== SearchOptions::TYPE_AUDIO ) {
				$fileres = '-fileres:0 ';
			}
			$request = new FauxRequest( [
				'format' => 'json',
				'uselang' => $langCode,
				'action' => 'query',
				'generator' => 'search',
				'gsrsearch' => ( $filetype ? "filetype:$filetype " : '' ) . $fileres . $term,
				'gsrnamespace' => implode( '|', $namespaces ),
				'gsrlimit' => $limit,
				'gsroffset' => $continue ?: 0,
				'gsrsort' => $sort,
				'gsrinfo' => 'totalhits|suggestion',
				'gsrprop' => 'size|wordcount|timestamp|snippet',
				'prop' => 'info|imageinfo|entityterms',
				'inprop' => 'url',
				'iiprop' => 'url|size|mime',
				'iiurlheight' => $type === SearchOptions::TYPE_IMAGE ? 180 : null,
				'iiurlwidth' => $width,
				'wbetterms' => 'label',
			] );
		}

		$externalSearchUri = $this->getConfig()->get( 'MediaSearchExternalSearchUri' );
		if ( $externalSearchUri ) {
			// Pull data from Commons: for use in testing
			$url = $externalSearchUri . '?' . http_build_query( $request->getQueryValues() );
			$request = MediaWikiServices::getInstance()->getHttpRequestFactory()
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

		if ( isset( $response[ 'error' ] ) ) {
			throw new SearchFailedException();
		}

		$results = array_values( $response['query']['pages'] ?? [] );
		$searchinfo = $response['query']['searchinfo'] ?? [];
		$continue = $response['continue']['gsroffset'] ?? null;

		uasort( $results, static function ( $a, $b ) {
			return $a['index'] <=> $b['index'];
		} );

		return [ $results, $searchinfo, $continue ];
	}

	/**
	 * @param array $queryParams
	 * @return array
	 */
	protected function getActiveFilters( array $queryParams ): array {
		return array_intersect_key( $queryParams, array_flip( SearchOptions::ALL_FILTERS ) );
	}

	/**
	 * Take an associative array of user-specified, supported filter settings
	 * (originally based on their incoming URL params) and ensure that all
	 * provided filters and values are appropriate for the current mediaType.
	 *
	 * @param array $activeFilters
	 * @param string $type
	 * @throws InvalidNamespaceGroupException
	 * @throws InvalidFiltersException
	 */
	protected function assertValidFilters( array $activeFilters, string $type ) {
		// Gather a [ key => allowed values ] map of all allowed values for the
		// given filter and media type
		$searchOptions = $this->searchOptions->getOptions();
		$allowedFilterValues = array_map( static function ( $options ) {
			return array_column( $options['items'], 'value' );
		}, $searchOptions[ $type ] ?? [] );

		// Filter the list of active filters, throwing out all invalid ones
		$validFilters = array_filter(
			$activeFilters,
			static function ( $value, $key ) use ( $allowedFilterValues ) {
				return isset( $allowedFilterValues[ $key ] ) && in_array( $value, $allowedFilterValues[ $key ] );
			},
			ARRAY_FILTER_USE_BOTH
		);
		$invalidFilters = array_diff( $activeFilters, $validFilters );

		// Custom namespace values (e.g. 1|2|3) will not be recognized as
		// valid input so they'll need special treatment here; if we fail
		// to derive a list of namespace ids from the input, then it's
		// invalid; otherwise, we can treat the namespace filter as valid
		if (
			isset( $invalidFilters[SearchOptions::FILTER_NAMESPACE] ) &&
			isset( $allowedFilterValues[SearchOptions::FILTER_NAMESPACE] )
		) {
			$this->searchOptions->getNamespaceIdsFromInput( $activeFilters[SearchOptions::FILTER_NAMESPACE] );
			unset( $invalidFilters[SearchOptions::FILTER_NAMESPACE] );
		}

		if ( count( $invalidFilters ) > 0 ) {
			throw new InvalidFiltersException(
				'Invalid filters ' . implode( ', ', array_keys( $invalidFilters )
			) );
		}
	}

	/**
	 * We need to see if the values for each active filter as specified by URL
	 * params match any of the pre-defined possible values for a given filter
	 * type. For example, an imageSize setting determined by url params like
	 * &fileres=500,1000 should be presented to the user as "Medium".
	 *
	 * @param array $activeFilters
	 * @param string $type
	 * @return array
	 */
	protected function getFiltersForDisplay( $activeFilters, $type ): array {
		$searchOptions = $this->searchOptions->getOptions();

		// reshape data array into a multi-dimensional [ value => label ] format
		// per type, so that we can more easily grab the relevant data without
		// having to loop it every time, for each filter
		$labels = array_map(
			static function ( $data ) {
				return array_column( $data['items'], 'label', 'value' );
			},
			$searchOptions[$type] ?? []
		);

		$display = [];
		foreach ( $activeFilters as $filter => $value ) {
			// use label (if found) or fall back to the given value
			$display[$filter] = $labels[$filter][$value] ?? $value;
		}

		// Custom namespace filter selection should be displayed as "custom"
		if (
			isset( $activeFilters[SearchOptions::FILTER_NAMESPACE] ) &&
			!in_array(
				$activeFilters[SearchOptions::FILTER_NAMESPACE],
				SearchOptions::NAMESPACE_GROUPS
			)
		) {
			// phpcs:ignore Generic.Files.LineLength.TooLong
			$display[SearchOptions::FILTER_NAMESPACE] = $labels[SearchOptions::FILTER_NAMESPACE][SearchOptions::NAMESPACES_CUSTOM];
		}

		return $display;
	}

	/**
	 * Prepare a string of original search term plus additional filter or sort
	 * parameters, suitable to be passed to the API. If no valid filters are
	 * provided, the original term is returned. Note: Filters are pre-pended
	 * to the search term.
	 *
	 * @param string $term
	 * @param array $filters [ "mimeType" => "tiff", "imageSize" => ">500" ]
	 * @return string "kittens filemime:tiff fileres:>500"
	 * @throws NoCirrusSearchException
	 */
	protected function getTermWithFilters( $term, $filters ): string {
		if ( $term === '' || !$filters ) {
			return $term;
		}

		// remove filters that aren't supported as search term keyword features;
		// those will need to be handled elsewhere, differently
		$validFilters = array_intersect_key( $filters, array_flip( $this->getSearchKeywords() ) );

		$allFilters = '';
		foreach ( $validFilters as $key => $value ) {
			$allFilters .= "$key:$value ";
		}

		$allFilters .= $this->getAssessments( $filters );

		return $allFilters . $term;
	}

	/**
	 * Prepare a string of assessments, used to generate a search string required for the API.
	 * If assessments are not enabled or empty it will return an empty string
	 *
	 * @param array $filters [ "mimeType" => "tiff", "imageSize" => ">500" ]
	 * @return string "haswbstatement::P6731=Q63348049"
	 */
	private function getAssessments( $filters ) {
		// Special handling for "Assessment" filters;
		// These are transformed into instances of the "haswbstatement:" keyword
		// using pre-configured wikidata statements
		$enabledAssessments = $this->getConfig()->get( 'MediaSearchAssessmentFilters' );
		$allAssessments = '';

		// If assessment filters have been enabled...
		if ( $enabledAssessments ) {
			// phpcs:ignore Generic.Files.LineLength.TooLong
			$assessmentData = $this->searchOptions->getAssessments( SearchOptions::TYPE_IMAGE )[ 'data' ][ 'statementData' ];
			$validAssessments = array_keys( $enabledAssessments );

			// and if the assessment param matches one of the specified
			// assessment values
			if (
				array_key_exists( SearchOptions::FILTER_ASSESSMENT, $filters ) &&
				in_array( $filters[ SearchOptions::FILTER_ASSESSMENT ], $validAssessments )
			) {
				$currentAssessment = array_search(
					$filters[ SearchOptions::FILTER_ASSESSMENT ],
					array_column( $assessmentData, 'value' )
				);

				$assessmentStatement = $assessmentData[ $currentAssessment ][ 'statement' ];
				$allAssessments = "$assessmentStatement ";
			}
		}

		return $allAssessments;
	}

	/**
	 * Returns a list of supported search keyword prefixes.
	 *
	 * @return array
	 * @throws NoCirrusSearchException
	 */
	protected function getSearchKeywords(): array {
		if ( !$this->searchConfig ) {
			throw new NoCirrusSearchException( 'CirrusSearch required for search keyword prefixes' );
		}
		$features = ( new FullTextKeywordRegistry( $this->searchConfig ) )->getKeywords();

		$keywords = [];
		foreach ( $features as $feature ) {
			$keywords = array_merge( $keywords, $feature->getKeywordPrefixes() );
		}
		return $keywords;
	}

	/**
	 * Determine what the API sort value should be
	 *
	 * @param array $activeFilters
	 * @return string
	 */
	protected function getSort( $activeFilters ): string {
		if ( array_key_exists( 'sort', $activeFilters ) && $activeFilters[ 'sort' ] === 'recency' ) {
			return 'create_timestamp_desc';
		} else {
			return 'relevance';
		}
	}

	/**
	 * Gather a list of thumbnail widths that are frequently requested & are
	 * likely to be warm in that; this is the configured thumbnail limits, and
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

	/**
	 * Determine what namespaces should be included in the search
	 *
	 * @param array $activeFilters
	 * @param string $type
	 * @return array
	 * @throws InvalidNamespaceGroupException
	 */
	protected function getSearchNamespaces( array $activeFilters, string $type ) {
		if ( $type !== SearchOptions::TYPE_PAGE ) {
			// searches on any tab other than "pages" are specific to NS_FILE
			return [ NS_FILE ];
		}

		if ( !isset( $activeFilters[ SearchOptions::FILTER_NAMESPACE ] ) ) {
			// no custom namespace = defaults to all
			return array_keys( $this->searchOptions->getNamespaceGroups()[ SearchOptions::NAMESPACES_ALL ] );
		}

		return $this->searchOptions->getNamespaceIdsFromInput(
			$activeFilters[ SearchOptions::FILTER_NAMESPACE ]
		);
	}

	/**
	 * @param string $suggestion filetype:bitmap|drawing -fileres:0 haswbstatement:P6731=Q63348049 cat
	 * @param array $activeFilters ["assessment" => "featured-image"]
	 * @return string
	 * @throws NoCirrusSearchException
	 */
	protected function extractSuggestedTerm( $suggestion, $activeFilters ) {
		$availableFilters = $this->getSearchKeywords();
		$suggestion = preg_replace(
			'/(?<=^|\s)(' . implode( '|', $availableFilters ) . '):.+?(?=$|\s)/',
			' ',
			$suggestion
		);

		$assessments = $this->getAssessments( $activeFilters );
		$suggestion = str_replace(
			$assessments,
			'',
			$suggestion
		);

		$suggestion = str_replace(
			'-fileres:0',
			'',
			$suggestion
		);

		return trim( $suggestion );
	}

	/**
	 * If the search API returns a suggested search, generate a clickable link
	 * that allows the user to run the suggested query immediately.
	 *
	 * @param array $queryParams
	 * @param string $suggestion
	 * @return string HTML
	 */
	protected function generateDidYouMeanLink( $queryParams, $suggestion ) {
		unset( $queryParams[ 'title' ] );
		$queryParams[ 'search' ] = $suggestion;
		return $this->linkRenderer->makeLink( $this->getPageTitle(), $suggestion, [], $queryParams );
	}

	/**
	 * Return formatted data for an individual search result
	 *
	 * @param array $result
	 * @param array $allResults
	 * @param string $type
	 * @return array
	 */
	protected function getResultData( array $result, array $allResults, $type ): array {
		// Required context for formatting
		$thumbLimits = $this->getThumbLimits();
		$userLanguage = $this->getLanguage();

		// Title
		$title = Title::newFromDBkey( $result['title'] );
		$filename = $title ? $title->getText() : $result['title'];
		$result += [ 'name' => $filename ];

		// Category info.
		if ( isset( $result['categoryinfo'] ) ) {
			$categoryInfoParams = [
				$userLanguage->formatNum( $result['categoryinfo']['size'] ),
				$userLanguage->formatNum( $result['categoryinfo']['subcats'] ),
				$userLanguage->formatNum( $result['categoryinfo']['files'] )
			];
			$result += [
				'categoryInfoText' => $this->msg(
					'mediasearch-category-info',
					$categoryInfoParams
				)->text()
			];
		}

		// Namespace prefix.
		$namespaceId = $title->getNamespace();
		$mainNsPrefix = preg_replace( '/^[(]?|[)]?$/', '', $this->msg( 'blanknamespace' ) );
		$result['namespacePrefix'] = $namespaceId === NS_MAIN ?
			$mainNsPrefix :
			$this->getContentLanguage()->getFormattedNsText( $namespaceId );

		// Last edited date.
		$result['lastEdited'] = $userLanguage->timeanddate( $result['timestamp'] );

		// Formatted page size.
		if ( isset( $result['size'] ) ) {
			$result['formattedPageSize'] = $userLanguage->formatSize( $result['size'] );
		}

		// Word count.
		if ( isset( $result['wordcount'] ) ) {
			$result['wordcountMessage'] = $this->msg(
				'mediasearch-wordcount',
				$userLanguage->formatNum( $result['wordcount'] )
			)->text();
		}

		// Formatted image size.
		if ( isset( $result['imageinfo'] ) && isset( $result['imageinfo'][0]['size'] ) ) {
			$result['imageSizeMessage'] = $this->msg(
				'mediasearch-image-size',
				$userLanguage->formatSize( $result['imageinfo'][0]['size'] )
			)->text();
		}

		if (
			$type === SearchOptions::TYPE_OTHER &&
			isset( $result['imageinfo'][0]['width'] ) &&
			isset( $result['imageinfo'][0]['height'] )
		) {
			$result['resolution'] = $userLanguage->formatNum( $result['imageinfo'][0]['width'] ) .
				' × ' . $userLanguage->formatNum( $result['imageinfo'][0]['height'] );
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
				if ( (int)$imageInfo['thumbwidth'] / (int)$imageInfo['thumbheight'] < 1 ) {
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
				$result['wrapperStyle'] = 'width: ' . min( [ $displayWidth, 350 ] ) . 'px;';
			}

			if ( count( $allResults ) <= 3 ) {
				$result['imageResultClass'] .= ' sdms-image-result--limit-size';
			}

			if ( $imageInfo[ 'mime' ] ) {
				$result[ 'extension' ] = $imageInfo[ 'mime' ];
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
	}
}
