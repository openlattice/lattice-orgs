/*
 * @flow
 */

import React from 'react';

import { faPlus } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconButton } from 'lattice-ui-kit';

import type { ButtonProps } from './BaseButton';

const PlusIcon = <FontAwesomeIcon fixedWidth icon={faPlus} />;

const Circle = ({ children, ...props } :ButtonProps) => (
  /* eslint-disable react/jsx-props-no-spreading */
  <IconButton {...props}>
    {PlusIcon}
  </IconButton>
  /* eslint-enable */
);

export default Circle;
