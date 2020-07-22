/*
 * @flow
 */

import React from 'react';

import { faPen } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'lattice-ui-kit';
import type { ButtonProps } from 'lattice-ui-kit';

const EditButton = (props :ButtonProps) => (
  /* eslint-disable react/jsx-props-no-spreading */
  <Button {...props}>
    <FontAwesomeIcon fixedWidth icon={faPen} />
  </Button>
  /* eslint-enable */
);

export default EditButton;
