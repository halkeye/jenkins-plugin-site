const axios = require('axios');
const crypto = require('crypto');

/*
plugins: `
  firstRelease: Date
  buildDate: Date
  categories: {
    id: String!
  }
  dependencies: {
    name: String
    title: String
    optional: Boolean
    version: String
    implied: Boolean
  }
  maintainers: {
    id: String
    name: String
    email: String
  }
  excerpt: String
  gav: String
  labels: {
    id: String!
  }
  name: String
  previousTimestamp: Date
  previousVersion: String
  releaseTimestamp: Date
  requiredCore: String
  scm: {
    issues: String
    link: String
    inLatestRelease: String
    sinceLatestRelease: String
    pullRequest: String
  }
  sha1: String
  // stats:
  title: String
  url: String
  version: String
  // securityWarnings:
  wiki: {
    content: String
    url: String
  }
`
*/

exports.sourceNodes = async (
  { actions, reporter },
  { /* options */ }
) => {
  const { createNode } = actions;

  // Do the initial fetch
  const activity = reporter.activityTimer('fetch plugin data');
  activity.start();

  let page = 1;
  try {
    while (1) {
      const pluginsContainer = await axios
        .get(`https://plugins.jenkins.io/api/plugins/?limit=100&page=${page}`)
        .then((results) => {
          if (results.status !== 200) {
            throw results.data;
          }
          return results.data;
        });

      for (const plugin of pluginsContainer.plugins) {
        createNode({
          ...plugin,
          id: plugin.name,
          parent: null,
          children: [],
          internal: {
            type: 'JenkinsPlugin',
            contentDigest: crypto
              .createHash('md5')
              .update(`plugin${plugin.name}`)
              .digest('hex')
          }
        });
      }
      page = pluginsContainer.page + 1;
      if (pluginsContainer.page > pluginsContainer.pages) {
        break;
      }
    }
  } catch (err) {
    reporter.panic(
      `gatsby-source-goodreads: Failed to parse API call -  ${err}`
    );
  }
  activity.end();
};
