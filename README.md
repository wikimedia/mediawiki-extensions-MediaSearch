MediaSearch is an alternative, media-focused way to display search results.

## Requirements

While not strictly required, we suggest installing these dependencies to
enhance the media search experience.

### System-level dependencies

- ElasticSearch (see [here](https://www.mediawiki.org/wiki/Extension:CirrusSearch#Dependencies)
for more information on how to install)

### MW Extensions

The following MediaWiki extensions are recommended:

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
// Leave blank/default (empty string) to use local API.
// To disable autocomplete suggestions completely, set to null.
$wgMediaSearchExternalEntitySearchBaseUri = 'https://www.wikidata.org/w/api.php';

// URI for getting search results from production during local development.
// If this is set, search API calls will be made to this URI. Left blank,
// search results will be retrieved from the local API by default.
$wgMediaSearchExternalSearchUri = 'https://commons.wikimedia.org/w/api.php';
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

## Testing

### Front-end test suite

This extension includes a front-end test suite powered by the [Jest](https://jestjs.io/)
framework. The tests also make extensive use of the official
[Vue.js testing library](https://vue-test-utils.vuejs.org/).

For more information about testing Vue code in MediaWiki, please consult the
[guide](https://www.mediawiki.org/wiki/Vue.js/Testing) here.

At runtime, our JS code relies on a number of objects in the global MediaWiki
JS environment. Some of these features need to be mocked during testing. The
`jest.setup.js` file is the best place for mocks that are needed in lots of
places. Individual test files can provide additional mocks or override what
already exists if more specific mocks are needed.

To run unit tests locally, use the following commands:

```
# install all required dependencies
npm install

# run all linters and front-end tests
npm run test

# run only the front-end unit tests by themselves
npm run test:unit
```

## See also

* [MediaSearch extension page on mediawiki.org](https://www.mediawiki.org/wiki/Extension:MediaSearch)
* [Media Search project page](https://commons.wikimedia.org/wiki/Commons:Structured_data/Media_search)
