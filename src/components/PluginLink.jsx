import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import styles from '../styles/Main.css';
import classNames from 'classnames';
import { cleanTitle } from '../commons/helper';

const PluginLink = ({ name, title }) => {
  return (
    <div className={classNames(styles.Item, 'Entry-box')}>
      <Link key={name} href={`/${name}`}>
        <a className="titleOnly">{cleanTitle(title)}</a>
      </Link>
    </div>
  );
};

PluginLink.propTypes = {
  name: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};

export default PluginLink;
