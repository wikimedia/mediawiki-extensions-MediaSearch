MediaSearch is an alternative, media-focused way to display search results.

## Requirements

While not strictly required, we suggest installing these dependencies to
enhance the media search experience.

### System-level dependencies

- ElasticSearch (see [here](https://www.mediawiki.org/wiki/Extension:CirrusSearch#Dependencies)
for more information on how to install)

### MW Extensions

The following Mediawiki extensions are recommended:

- [CirrusSearch](https://www.mediawiki.org/wiki/Extension:CirrusSearch#Installation)
  and dependencies, for improved search results & per-mediatype tab support

If you have a Wikibase repository, we strongly recommend also installing
these extensions to allow more data to be used to enhance the search results:

- [WikibaseMediaInfo](https://www.mediawiki.org/wiki/Extension:WikibaseMediaInfo#Installation)
- [WikibaseCirrusSearch](https://www.mediawiki.org/wiki/Extension:WikibaseCirrusSearch#Installation)

## Installation

After the extensions listed above are set up properly, enable the extension by
adding `wfLoadExtension( 'MediaSearch' );` along with the required config
variables to `LocalSettings.php`.

You might need to run `composer install` in the extension directory, or in the
root directory of your MediaWiki installation if you are using a setup that
merges all extension's dependencies into MediaWiki's vendor directory.

## Configuration

Extension configuration variables are sets of key-value pairs. They are
documented in more detail in `extension.json`. Config variables should be added
to `LocalSettings.php`. The following config options are available for this
extension:

```php
// External entity search base URI (for autocomplete suggestions, optional)
$wgMediaSearchExternalEntitySearchBaseUri = 'https://www.wikidata.org/w/api.php';

// For local development with production results (from Commons and Wikidata)
$wgMediaSearchLocalDev = true;
```

## Coding conventions

### JavaScript/Vue

As much as possible, we default to the [Vue Style Guide](https://vuejs.org/v2/style-guide/).

For now, we are not using full single-file components because we need to be
able to compile Less separately so it can be included immediately before the
app loads to style the PHP UI.

### CSS/Less

Since Wikimedia UI base variables aren't in core, we require them as a package
dependency, then use a shell script to copy them to the `lib` directory. To
update the base variables, require the new version in package.json and install
it, then run `npm run build-lib` to copy the updated file into `lib`. Commit the
updated files.

We're including the base variables in our custom variables file,
`resources/mediasearch-variables.less`. To use them in other files, include
`mediasearch-variables.less` rather than directly including the base file itself.

The CSS class name prefix `sdms` should be used for extension-level components.
`sd` should be used for base components to keep them extension-agnostic, in case
we decide to pull them out into a separate library.

## See also

* [MediaSearch extension page on mediawiki.org](https://www.mediawiki.org/wiki/Extension:MediaSearch)
* [Media Search project page](https://commons.wikimedia.org/wiki/Commons:Structured_data/Media_search)
