/* eslint-env node */
/* eslint-disable no-console */
const url = require('url');

const axios = require('axios');
const cheerio = require('cheerio');

async function makeReactLayout() {
  const headerUrl = process.env.HEADER_FILE || 'https://jenkins.io/template/index.html';

  if (!headerUrl) {
    return null;
  }

  const lines = [
    'import React from \'react\';',
    'import Helmet from \'react-helmet\';',
  ];

  console.info(`Downloading header file from '${headerUrl}'`);
  const parsedHeaderUrl = url.parse(headerUrl);
  const baseUrl = `${parsedHeaderUrl.protocol}//${parsedHeaderUrl.hostname}`;
  const content = await axios
    .get(headerUrl)
    .then((results) => {
      if (results.status !== 200) {
        throw results.data;
      }
      return results.data;
    });

  const $ = cheerio.load(content, { decodeEntities: false });
  $('img, script').each(function () {
    const src = $(this).attr('src');
    if (src && src.startsWith('/')) {
      $(this).attr('src', `${baseUrl}${src}`);
    }
  });
  $('a, link').each(function () {
    const href = $(this).attr('href');
    if (href !== undefined && href.startsWith('/')) {
      $(this).attr('href', `${baseUrl}${href}`);
    }
  });
  // Even though we're supplying our own this one still causes a conflict.
  $('link[href*="/css/font-icons.css"]').remove();
  // Prevents: Access to resource at 'https://jenkins.io/site.webmanifest' from origin 'https://plugins.jenkins.io' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
  $('link[href*="site.webmanifest"]').remove();
	// No jquery in react
  $('script[src*="/assets/bower/jquery/jquery.min.js"]').remove();
  // FIXME - delete all the bower items?

  $('#grid-box').append('{children}');

  const keyConversion = {
    class: 'className',
  };

	const handleNode = (node, indent = 0) => {
    if (node.name === 'script') {
      // FIXME - handle me
      return;
    }

    const prefix = ''.padStart(6+indent);
    const attrs = Object.entries(node.attribs || {}).map(([key, val]) => {
      key = keyConversion[key] || key;
      return `${key}="${val}"`;
    }).join(' ');
    if (node.type === 'comment') {
      return;
    } else if (node.type === 'text') {
      const text = node.data.trim() === '{children}' ?
        node.data.trim() : 
        node.data.trim().replace(/([{}]+)/g,'{\'$1\'}'); // from https://github.com/facebook/react/issues/1545#issuecomment-461696773
      lines.push(`${prefix}${text}`);
    } else if (node.children && node.children.length) {
      lines.push(`${prefix}<${node.name} ${attrs}>`);
      node.children.forEach(child => handleNode(child, indent+2));
      lines.push(`${prefix}</${node.name}>`);
    } else {
      if (!node.name) {
        console.log(node);
      }
      lines.push(`${prefix}<${node.name} ${attrs} />`);
    }
	};

  lines.push('export default function Layout({ children }) {');
  lines.push('  return (');
  lines.push('    <React.Fragment>');
  lines.push('      <Helmet>');
  $('head').children().each((idx, child) => handleNode(child, 2));
  lines.push('      </Helmet>');
  $('body').children().each((idx, child) => handleNode(child, 0));
  lines.push('    </React.Fragment>');
  lines.push('  );');


  lines.push('}');
  const output = lines.map(str => str.trimEnd()).filter(Boolean).join('\n');
  return output;
}

exports.makeReactLayout = makeReactLayout;

if (require.main === module) {
  makeReactLayout().then(console.log);
}
