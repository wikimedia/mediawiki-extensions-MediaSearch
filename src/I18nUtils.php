<?php

namespace MediaWiki\Extension\MediaSearch;

use InvalidArgumentException;

class I18nUtils {
	/**
	 * Reads an array of JSON i18n files & turns them into a PHP array.
	 *
	 * @param string $jsonDir
	 * @return array
	 */
	public static function jsonFilesToPHPArray( string $jsonDir ): array {
		$paths = glob( $jsonDir );
		if ( !$paths ) {
			return [];
		}

		$messages = [];
		foreach ( $paths as $path ) {
			$language = static::getLanguageFromJson( $path );
			$messages[$language] = static::getMessagesFromJson( $path );
		}

		return $messages;
	}

	/**
	 * Does the same as `jsonFilesToPHPArray`, but allows reading from
	 * other extensions, with a changed prefix.
	 *
	 * @param string $jsonDir
	 * @param string $oldPrefix
	 * @param string $newPrefix
	 * @return array
	 */
	public static function otherJsonFilesToPHPArray( string $jsonDir, string $oldPrefix, string $newPrefix ): array {
		$messages = static::jsonFilesToPHPArray( $jsonDir );

		return array_map( static function ( array $messages ) use ( $oldPrefix, $newPrefix ): array {
			$messages = static::filterByPrefix( $messages, $oldPrefix );
			return static::changePrefixes( $messages, $oldPrefix, $newPrefix );
		}, $messages );
	}

	/**
	 * Returns the language of an i18n json file.
	 *
	 * @param string $path
	 * @return string
	 */
	private static function getLanguageFromJson( string $path ): string {
		preg_match(
			'/([^' . preg_quote( DIRECTORY_SEPARATOR, '/' ) . ']+?)\.json$/',
			$path,
			$match
		);

		if ( !$match ) {
			throw new InvalidArgumentException( 'Invalid path name, contains no language' );
		}

		return $match[1];
	}

	/**
	 * Returns the i18n messages from an i18n json file.
	 *
	 * @param string $path
	 * @return array
	 */
	private static function getMessagesFromJson( string $path ): array {
		$content = file_get_contents( $path );
		if ( !$content ) {
			return [];
		}

		$i18n = json_decode( $content, true );
		if ( !is_array( $i18n ) ) {
			return [];
		}

		unset( $i18n['@metadata'] );

		return $i18n;
	}

	/**
	 * Filter messages to only keep those that match a certain prefix.
	 *
	 * @param array $messages
	 * @param string $prefix
	 * @return array
	 */
	private static function filterByPrefix( array $messages, string $prefix ): array {
		return array_filter( $messages, static function ( $key ) use ( $prefix ) {
			return (bool)preg_match( '/^' . preg_quote( $prefix, '/' ) . '/', $key );
		}, ARRAY_FILTER_USE_KEY );
	}

	/**
	 * Change the prefixes of the message keys.
	 *
	 * @param array $messages
	 * @param string $oldPrefix
	 * @param string $newPrefix
	 * @return array
	 */
	private static function changePrefixes( array $messages, string $oldPrefix, string $newPrefix ): array {
		return array_combine(
			array_map( static function ( $key ) use ( $oldPrefix, $newPrefix ) {
				return preg_replace(
					'/^' . preg_quote( $oldPrefix, '/' ) . '/',
					$newPrefix,
					$key
				);
			}, array_keys( $messages ) ),
			$messages
		);
	}
}
