<?php

$cfg = require __DIR__ . '/../vendor/mediawiki/mediawiki-phan-config/src/config.php';

$cfg['directory_list'] = array_merge( $cfg['directory_list'], [
	'../../extensions/CirrusSearch',
	'../../extensions/Elastica',
	'../../extensions/WikibaseCirrusSearch',
] );

$cfg['exclude_analysis_directory_list'] = array_merge( $cfg['exclude_analysis_directory_list'], [
	'../../extensions/CirrusSearch',
	'../../extensions/Elastica',
	'../../extensions/WikibaseCirrusSearch',
] );

return $cfg;
