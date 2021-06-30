<?php

include_once __DIR__ . '/src/I18nUtils.php';

use MediaWiki\Extension\MediaSearch\I18nUtils;

// Right now, all messages exist in this repository, but some of them have not
// yet been renamed and have the "wikibasemediainfo-special-mediasearch-"
// prefix. All we need to do is grab all messages and swap the prefixes. This
// entire script can be removed once all messages have been renamed to the
// "mediasearch-" prefix.
$messages = I18nUtils::otherJsonFilesToPHPArray(
	__DIR__ . '/i18n/*.json',
	'wikibasemediainfo-special-mediasearch-',
	'mediasearch-'
);
