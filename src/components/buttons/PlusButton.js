/*
 * @flow
 */

import React from 'react';

import { faPlus } from '@fortawesome/pro-regular-svg-icons';

import BaseButton from './BaseButton';
import type { ButtonProps } from './BaseButton';

const PlusButton = ({ children, ...props } :ButtonProps) => (
  /* eslint-disable react/jsx-props-no-spreading */
  <BaseButton {...props} icon={faPlus}>
    {children}
  </BaseButton>
  /* eslint-enable */
);

export default PlusButton;
