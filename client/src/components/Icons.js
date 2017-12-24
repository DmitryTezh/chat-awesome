import React from 'react';
import PropTypes from 'prop-types';

export const Icon = ({ image, size, className = '' }) =>
    <i className={`fa fa-${image} fa-${size || 'fw'} ${className}`} aria-hidden="true"/>;
Icon.propTypes = {
    image: PropTypes.string.isRequired,
    size: PropTypes.string,
    className: PropTypes.string
};