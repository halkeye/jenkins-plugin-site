/* eslint-env node */
/* eslint-disable no-console */
const path = require('path');
const fs = require('fs');

const { makeReactLayout } = require('./utils.js');

exports.onPreBootstrap = async () => {
  const layout = await makeReactLayout();
  if (layout) {
    fs.writeFileSync('./src/layout.jsx', layout);
  }
};

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;
  const pluginPage = path.resolve('src/templates/plugin.jsx');
  const indexPage = path.resolve('src/templates/index.jsx');

  createPage({
    path: '/',
    component: indexPage,
    context: { }
  });

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
