import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styles from '../styles/Main.css';
import classNames from 'classnames';
import Filters from './Filters';
import Footer from './Footer';
import SearchBox from './SearchBox';
import SearchResults from './SearchResults';
import Views from './Views';
import { actions } from '../actions';
import { isFiltered, showFilter, showResults, view } from '../selectors';
import { createSelector } from 'reselect';

class Main extends React.PureComponent {

  // This is ultimately called in server.js to ensure the initial data is loaded prior to serving
  // up the response. Thus making this SEO friendly and avoids an unnecssary async call after
  // handing off to the browser.
  static async getInitialProps({ query, store, location, params, history }) { // eslint-disable-line no-unused-vars
    console.log({ query, store, location, params, history });
    return store.dispatch(actions.loadInitialData())
      .then(store.dispatch(actions.clearFirstVisit()));
  }

  static defaultProps = {
    location: {
      query: {
      }
    }
  };

  static propTypes = {
    clearFirstVisit: PropTypes.func.isRequired,
    isFiltered: PropTypes.bool.isRequired,
    loadInitialData: PropTypes.func.isRequired,
    parseQueryParams: PropTypes.func.isRequired,
    showFilter: PropTypes.bool.isRequired,
    showResults: PropTypes.bool.isRequired,
    search: PropTypes.func.isRequired,
    view: PropTypes.string.isRequired
  };

  handleOnSubmit = (event) => {
    event.preventDefault();
    this.props.search({ resetPage: true });
  }

  componentDidMount() {
    // These are only called for client side rendering. Otherwise fetchData is used.
    this.props.loadInitialData();
    this.props.clearFirstVisit();
  }

  render() {
    return (
      <div>
        <div className={classNames(styles.ItemFinder, this.props.view, { showResults: this.props.showResults },
            { isFiltered: this.props.isFiltered }, 'item-finder')}>
          <form ref="form" action="#" id="plugin-search-form"
              className={classNames(styles.HomeHeader, { showFilter: this.props.showFilter }, 'HomeHeader jumbotron')}
              onSubmit={this.handleOnSubmit}>
            <h1>Plugins Index</h1>
            <p>
              Discover the 1000+ community contributed Jenkins plugins to support building, deploying and automating any project.
            </p>
            <nav className={classNames(styles.navbar, 'navbar')}>
              <div className="nav navbar-nav">
                <SearchBox handleOnSubmit={this.handleOnSubmit} />
                <Views />
              </div>
            </nav>
            <Filters />
          </form>
          <SearchResults />
          <Footer />
        </div>
      </div>
    );
  }

}

const selectors = createSelector(
  [ isFiltered, showFilter, showResults, view ],
  ( isFiltered, showFilter, showResults, view ) =>
  ({ isFiltered, showFilter, showResults, view })
);

export default connect(selectors, actions)(Main);
