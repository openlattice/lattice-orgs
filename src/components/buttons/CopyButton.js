/*
 * @flow
 */

import React from 'react';

import { faCopy } from '@fortawesome/pro-light-svg-icons';

import BaseButton from './BaseButton';
import type { ButtonProps } from './BaseButton';

const CopyButton = ({ children, ...props } :ButtonProps) => (
  /* eslint-disable react/jsx-props-no-spreading */
  <BaseButton {...props} icon={faCopy}>
    {children}
  </BaseButton>
  /* eslint-enable */
);

export default CopyButton;
