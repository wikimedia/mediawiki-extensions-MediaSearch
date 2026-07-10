# MediaSearch Contributing Guide

## Welcome

Welcome to the MediaSearch Contributing Guide, and thank you for your
interest.

This guide describes the main ways you can contribute to MediaSearch,
including:

- Bug reports and bug fixes
- Documentation improvements

At this time, we do not accept feature requests.

### Overview

MediaSearch is a MediaWiki extension that provides an alternative,
media-focused way to display search results through the Special:MediaSearch
page. It is used in production on Wikimedia projects, including Wikimedia
Commons.

For more information, refer to the [README][readme] and the
[MediaSearch extension][mw-extension] page on mediawiki.org.

### Community engagement

Refer to the following channels to connect with fellow contributors or to stay
up-to-date with news about MediaSearch:

- Follow tasks and discussion on the [MediaSearch Phabricator
  workboard][phabricator-workboard].
- Refer to the [Media Search project page][commons-project] on Wikimedia
  Commons.
- Participate in discussions in [Village Pump][village-pump].
- Stay updated on the latest news and changes to the project by following
  [MediaWiki's version lifecycle page][version-lifecycle].

## Contributing

### Code of conduct

Before contributing, read our [Code of Conduct][coc] to learn more about our
community guidelines and expectations.

### Bug reports

We use Phabricator to track tasks and bug reports. To report a bug:

1. **Search for existing issues**: Check if the issue has already been reported
   in [Phabricator][phabricator-workboard].
2. **Create a new issue**: If the issue doesn't exist, create a new issue on
   Phabricator through the Create Task dropdown.
3. **Provide details**: Include:
   - A clear description of the issue
   - Steps to reproduce
   - Expected vs. actual behavior
   - Your environment (MediaWiki version, browser, etc.)
   - Screenshots or error messages if applicable

### Proposals and feature requests

To share your new ideas for the project, perform the following actions:

1. Create an issue on [Phabricator][phabricator-workboard].
2. Describe your idea clearly, including the problem you're trying to solve.
3. Wait for feedback from maintainers before starting implementation.

### Code contribution

MediaSearch uses [Gerrit][gerrit] for code review. For local setup, coding
conventions, testing, and development workflow, refer to the [README][readme].
For Gerrit workflow and general MediaWiki contribution practices, refer to the
[Gerrit/Tutorial][gerrit-tutorial] and [How to become a MediaWiki
hacker][mw-hacker].

[readme]: README.md
[mw-extension]: https://www.mediawiki.org/wiki/Extension:MediaSearch
[commons-project]: https://commons.wikimedia.org/wiki/Commons:Structured_data/Media_search
[village-pump]: https://en.wikipedia.org/wiki/Wikipedia:Village_pump
[version-lifecycle]: https://www.mediawiki.org/wiki/Version_lifecycle
[coc]: CODE_OF_CONDUCT.md
[phabricator-workboard]: https://phabricator.wikimedia.org/tag/mediasearch/
[gerrit]: https://www.mediawiki.org/wiki/Gerrit
[gerrit-tutorial]: https://www.mediawiki.org/wiki/Gerrit/Tutorial
[mw-hacker]: https://www.mediawiki.org/wiki/How_to_become_a_MediaWiki_hacker
