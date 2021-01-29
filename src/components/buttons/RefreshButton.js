/*
 * @flow
 */

import React from 'react';

import { faSyncAlt } from '@fortawesome/pro-light-svg-icons';

import BaseButton from './BaseButton';
import type { ButtonProps } from './BaseButton';

const RefreshButton = ({ children, ...props } :ButtonProps) => (
  /* eslint-disable react/jsx-props-no-spreading */
  <BaseButton {...props} color="default" icon={faSyncAlt}>
    {children}
  </BaseButton>
  /* eslint-enable */
);

export default RefreshButton;
