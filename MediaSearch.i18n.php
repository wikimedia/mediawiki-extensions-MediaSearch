<?php

use MediaWiki\Extension\MediaSearch\I18nUtils;

// 1. use messages from mediainfo if they exist - they will continue to
// receive updates and have the latest translations;
// 2. default to mediasearch for messages where there is no translation in
// mediainfo, so we can remove them there after having them copied here;
// 3. after that, we simply drop this nasty php script and simply let
// extension.json point to the json files, which have now become the only &
// up to date source
$messages = array_replace_recursive(
	I18nUtils::jsonFilesToPHPArray( __DIR__ . '/i18n/*.json' ),
	I18nUtils::otherJsonFilesToPHPArray(
		__DIR__ . '/../WikibaseMediaInfo/i18n/*.json',
		'wikibasemediainfo-special-mediasearch-',
		'mediasearch-'
	)
);
