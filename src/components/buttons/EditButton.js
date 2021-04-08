/*
 * @flow
 */

import React from 'react';

import { faPen } from '@fortawesome/pro-solid-svg-icons';

import BaseButton from './BaseButton';
import type { ButtonProps } from './BaseButton';

const EditButton = ({ children, ...props } :ButtonProps) => (
  /* eslint-disable react/jsx-props-no-spreading */
  <BaseButton {...props} icon={faPen}>
    {children}
  </BaseButton>
  /* eslint-enable */
);

export default EditButton;
