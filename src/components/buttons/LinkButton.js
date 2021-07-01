/*
 * @flow
 */

import React from 'react';

import { faLink } from '@fortawesome/pro-solid-svg-icons';

import BaseButton from './BaseButton';
import type { ButtonProps } from './BaseButton';

const LinkButton = ({ children, ...props } :ButtonProps) => (
  /* eslint-disable react/jsx-props-no-spreading */
  <BaseButton {...props} icon={faLink}>
    {children}
  </BaseButton>
  /* eslint-enable */
);

export default LinkButton;
