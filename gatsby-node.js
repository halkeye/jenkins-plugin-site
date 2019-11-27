const path = require('path');

exports.createPages = async ({ graphql, actions }) => {
  const { createPage, createRedirect } = actions;
  const pluginPage = path.resolve('src/templates/plugin.jsx');

  await graphql(`{
    allJenkinsPlugin {
      edges {
        node {
          id
          name
        }
      }
    }
  }`).then(result => {
    if (result.errors) {
      console.log(result.errors);
      throw result.errors;
    }

    result.data.allJenkinsPlugin.edges.forEach(edge => {
      createPage({
        path: edge.node.name,
        component: pluginPage,
        context: {
          id: edge.node.id
        }
      });
    });
  });
};
