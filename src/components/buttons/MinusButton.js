/*
 * @flow
 */

import React from 'react';

import { faMinus } from '@fortawesome/pro-regular-svg-icons';

import BaseButton from './BaseButton';
import type { ButtonProps } from './BaseButton';

const MinusButton = ({ children, ...props } :ButtonProps) => (
  /* eslint-disable react/jsx-props-no-spreading */
  <BaseButton {...props} icon={faMinus}>
    {children}
  </BaseButton>
  /* eslint-enable */
);

export default MinusButton;
