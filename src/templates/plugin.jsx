import { graphql , Link, navigate } from 'gatsby';
import React from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';
import { Helmet } from 'react-helmet';

import { cleanTitle } from '../commons/helper';
import Layout from '../layout';
import LineChart from '../components/LineChart';
import NotFound from '../components/NotFound';
import Spinner from '../components/Spinner';

function Dependencies({ dependencies } ) {
  const [isShowImplied, setShowImplied] = React.useState(false);
  // console.log({ isShowImplied });
  const showImplied = (e) => {
    e.preventDefault();
    setShowImplied(true);
  };

  if (!dependencies || dependencies.length === 0) {
    return (<div className="empty">No dependencies found</div>);
  }

  return dependencies.sort((a, b) => a.implied === b.implied ? (a.optional === b.optional ? 0 : a.optional ? 1 : -1 ) : (a.implied ? 1 : -1)).map((dependency) => {
    const kind = !dependency.optional ? (dependency.implied ? 'implied' : 'required') : 'optional';
    if (kind === 'implied') {
      return (
        <div key={dependency.name} className={kind}>
          <Link to={`/${dependency.name}`}>
            {dependency.title} v.{dependency.version} <span className="req">({kind})</span>
          </Link>
          <a href="#" onClick={showImplied}><span className="req">(what&apos;s this?)</span></a>
        </div>
      );
    }
    return (
      <div key={dependency.name} className={kind}>
        <Link to={`/${dependency.name}`}>
          {dependency.title} v.{dependency.version} <span className="req">({kind})</span>
        </Link>
      </div>
    );
  });
}

function Labels({labels}) {
  if (!labels || labels.length === 0) {
    return (<div className="empty">This plugin has no labels</div>);
  }
  return labels.map((id) => {
    const label = labels.find((label) => label.id === id);
    const text = label !== undefined ? label.title : id;
    return (
      <div className="label-link" key={id}>
        <Link to={`/?labels=${id}`}>{text}</Link>
      </div>
    );
  });
}

function Maintainers({ maintainers }) {
  return maintainers.map((maintainer) => {
    // TODO: Adjust Main.state to add to maintainers filter
    const name = maintainer.name || maintainer.id;
    return <div className="maintainer" key={maintainer.id}>{name}</div>;
  });
}

function LastReleased({plugin}) {
  const getTime = (plugin) => {
    if (plugin.releaseTimestamp !== null) {
      // 2017-02-09T15:19:10.00Z
      return moment.utc(plugin.releaseTimestamp);
    } else {
      // 2017-02-09
      return moment.utc(plugin.buildDate, 'YYYY-MM-DD');
    }
  };
  const time = getTime(plugin);
  return (
    <div>Last released: <span  title={time.format('dddd, MMMM Do YYYY')}>
        {time.fromNow()}</span>
    </div>
  );
}

LastReleased.propTypes = {
  plugin: PropTypes.shape({
    releaseTimestamp: PropTypes.string,
    buildDate: PropTypes.string
  })
};

function shouldShowWikiUrl({ url }) {
  return url && (url.startsWith('https://wiki.jenkins-ci.org') || url.startsWith('https://wiki.jenkins.io'));
}


//getImpliedModal() {
//  return (
//    <div className="badge-box">
//      <ModalView hideOnOverlayClicked ignoreEscapeKey ref={(modal) => { this.impliedModal = modal; }}>
//        <Header>
//          <div>About Implied Plugin Dependencies</div>
//        </Header>
//        <Body>
//          <div>
//            <p>
//              Features are sometimes detached (or split off) from Jenkins core and moved into a plugin.
//              Many plugins, like Subversion or JUnit, started as features of Jenkins core.
//            </p>
//            <p>
//              Plugins that depend on a Jenkins core version before such a plugin was detached from core may or may not actually use any of its features.
//              To ensure that plugins don't break whenever functionality they depend on is detached from Jenkins core, it is considered to have a dependency on the detached plugin if it declares a dependency on a version of Jenkins core before the split.
//              Since that dependency to the detached plugin is not explicitly specified, it is <em>implied</em>.
//            </p>
//            <p>
//              Plugins that don't regularly update which Jenkins core version they depend on will accumulate implied dependencies over time.
//            </p>
//          </div>
//        </Body>
//      </ModalView>
//    </div>
//  );
//}

function ActiveWarnings({ securityWarnings }) {
  const [isShowWarnings, setShowImplied] = React.useState(false);
  const showWarnings = (e) => {
    e.preventDefault();
    setShowWarnings(true);
  };
  if (!securityWarnings) {
    return null;
  }
  const active = securityWarnings.filter(warning => warning.active);
  if (active.length == 0) {
    return null;
  }
  return (
    <div className="badge-box">
      <span className="badge active warning" onClick={showWarnings} />
      {/*
      <ModalView hideOnOverlayClicked ignoreEscapeKey ref={(modal) => { this.warningsModal = modal; }}>
        <Header>
          <div>Active Security Warnings</div>
        </Header>
        <Body>
          <div>
            <ul>
              {active.map(warning => {
                return (
                  <li>
                    <h3><a href={warning.url}>{warning.message}</a></h3>
                    <ul>
                      {warning.versions.map(version => {
                        return (
                          <li>
                            <ReadableVersion version={version} active />
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </div>
        </Body>
      </ModalView>
      */}
    </div>
  );
}

ActiveWarnings.propTypes = {
  securityWarnings: PropTypes.arrayOf(PropTypes.shape({
    active: PropTypes.boolean,
    id: PropTypes.string,
    message: PropTypes.string,
    url: PropTypes.string,
    versions: PropTypes.arrayOf(PropTypes.shape({
      firstVersion: PropTypes.string,
      lastVersion: PropTypes.string,
    }))
  })),
};

function InactiveWarnings({securityWarnings}) {
  if (!securityWarnings) {
    return null;
  }
  const inactive = securityWarnings.filter(warning => !warning.active);
  if (inactive.length == 0) {
    return null;
  }
  return (
    <div>
      <h6>Previous Security Warnings</h6>
      <ul>
        {inactive.map(warning => {
          return (
            <li key={warning.ur}>
              <h7><a href={warning.url}>{warning.message}</a></h7>
              <ul>
                {warning.versions.map((version, idx) => {
                  return (
                    <li key={idx}>
                      <ReadableVersion version={version} active={false} />
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

InactiveWarnings.propTypes = {
  securityWarnings: PropTypes.arrayOf(PropTypes.shape({
    active: PropTypes.boolean,
    id: PropTypes.string,
    message: PropTypes.string,
    url: PropTypes.string,
    versions: PropTypes.arrayOf(PropTypes.shape({
      firstVersion: PropTypes.string,
      lastVersion: PropTypes.string,
    }))
  })),
};

function ReadableVersion({ version, active }) {
  if (version.firstVersion && version.lastVersion) {
    return `Affects version ${version.firstVersion} to ${version.lastVersion}`;
  } else if (version.firstVersion && active) {
    return `Affects version ${version.lastVersion} and later`;
  } else if (version.lastVersion) {
    return `Affects version ${version.lastVersion} and earlier`;
  } else {
    return active ? 'Affects all versions' : 'Affects some versions';
  }
}

function ReadableInstalls({ currentInstalls}) {
  return currentInstalls != 0 ? currentInstalls : 'No usage data available';
}

function PluginPage({ data: { jenkinsPlugin: plugin }}) {
  const beforeClose = (event) => {
    event && event.preventDefault();
    navigate('/');
    return;
  };
  return (
    <Layout>
      <Helmet>
        <title>{cleanTitle(plugin.title)}</title>
        <meta content={cleanTitle(plugin.title)} name="apple-mobile-web-app-title" />
        <meta content={cleanTitle(plugin.title)} name="twitter:title" />
        <meta content={cleanTitle(plugin.title)} property="og:title" />
        <meta content="Jenkins plugin" property="og:site_name" />
      </Helmet>
      <section className="modalview">
        <div className="dialog">
          <div className="row flex">
            <div className="col-md-9 main">
              <div className="container-fluid padded">
                <h1 className="title">
                  {cleanTitle(plugin.title)}
                  <ActiveWarnings securityWarnings={plugin.securityWarnings} />
                  {/*this.getImpliedModal()*/}
                  <span className="v">{plugin.version}</span>
                  <span className="sub">Minimum Jenkins requirement: {plugin.requiredCore}</span>
                  <span className="sub">ID: {plugin.name}</span>
                </h1>
                <div className="row flex">
                  <div className="col-md-4">
                    {plugin.stats &&  <div>Installs: <ReadableInstalls currentInstalls={plugin.stats.currentInstalls} /></div>}
                    {plugin.scm && plugin.scm.link && <div><a href={plugin.scm.link}>GitHub →</a></div>}
                    <LastReleased plugin={plugin} />
                  </div>
                  <div className="col-md-4 maintainers">
                    <h5>Maintainers</h5>
                    <Maintainers maintainers={plugin.maintainers} />
                  </div>
                  <div className="col-md-4 dependencies">
                    <h5>Dependencies</h5>
                    <Dependencies dependencies={plugin.dependencies} />
                  </div>
                </div>
                {plugin.wiki.content && <div className="content" dangerouslySetInnerHTML={{__html: plugin.wiki.content}} />}
              </div>
            </div>
            <div className="col-md-3 gutter">
              <a href={`https://updates.jenkins.io/download/plugins/${plugin.name}` }
                className="btn btn-secondary">
                <i className="icon-box" />
                <span>Archives</span>
                <span className="v">Get past versions</span>
              </a>
              <div className="chart">
                <LineChart
                  total={plugin.stats.currentInstalls}
                  installations={plugin.stats.installations}
                />
              </div>
              <h5>Labels</h5>
              <Labels labels={plugin.labels} />
              {plugin.wiki && shouldShowWikiUrl(plugin.wiki) &&
                  <div className="update-link">
                    <h6>Are you maintaining this plugin?</h6>
                    <p>Visit the <a href={plugin.wiki.url} target="_wiki">Jenkins Plugin Wiki</a> to edit this content.</p>
                  </div>
              }
              <InactiveWarnings securityWarnings={plugin.securityWarnings} />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

PluginPage.propTypes = {
  data: PropTypes.shape({
    jenkinsPlugin: PropTypes.shape({
      dependencies: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        title: PropTypes.string,
        optional: PropTypes.bool,
        implied: PropTypes.bool,
        version: PropTypes.string
      })),
      excerpt: PropTypes.string,
      labels: PropTypes.arrayOf(PropTypes.string),
      maintainers: PropTypes.arrayOf(PropTypes.shape({
        email: PropTypes.string,
        id: PropTypes.string,
        name: PropTypes.string
      })),
      name: PropTypes.string.isRequired,
      requiredCore: PropTypes.string,
      scm: PropTypes.shape({
        inLatestRelease: PropTypes.string,
        issues: PropTypes.string,
        link: PropTypes.string,
        pullRequests: PropTypes.string,
        sinceLatestRelease: PropTypes.string
      }),
      securityWarnings: PropTypes.arrayOf(PropTypes.shape({
        active: PropTypes.boolean,
        id: PropTypes.string,
        message: PropTypes.string,
        url: PropTypes.string,
        versions: PropTypes.arrayOf(PropTypes.shape({
          firstVersion: PropTypes.string,
          lastVersion: PropTypes.string,
        }))
      })),
      sha1: PropTypes.string,
      stats: PropTypes.shape({
        currentInstalls: PropTypes.number.isRequired,
        installations: PropTypes.arrayOf(PropTypes.shape({
          timestamp: PropTypes.number,
          total: PropTypes.number
        }))
      }).isRequired,
      title: PropTypes.string.isRequired,
      wiki: PropTypes.shape({
        content: PropTypes.string,
        url: PropTypes.string
      }).isRequired,
      version: PropTypes.string
    }).isRequired
  }).isRequired
};

/* eslint no-undef: "off" */
export const pageQuery = graphql`
  query PluginBySlug($name: String!) {
    jenkinsPlugin(name: {eq: $name}) {
      id
      gav
      title
      url
      version
      wiki {
        url
      }
      stats {
        currentInstalls
        trend
      }
      sha1
      securityWarnings {
        active
        id
        message
        url
        versions {
          firstVersion
          lastVersion
        }
      }
      scm {
        link
      }
      requiredCore
      releaseTimestamp
      previousVersion
      previousTimestamp
      name
      labels
      maintainers {
        email
        id
        name
      }
      firstRelease
      excerpt
      categories
      buildDate
      dependencies {
        implied
        name
        optional
        title
        version
      }
    }
  }
`;

export default PluginPage;

