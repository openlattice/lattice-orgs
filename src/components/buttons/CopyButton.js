/*
 * @flow
 */

import React from 'react';

import { faCopy } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'lattice-ui-kit';

const CopyButton = (props :Object) => (
  /* eslint-disable react/jsx-props-no-spreading */
  <Button {...props}>
    <FontAwesomeIcon fixedWidth icon={faCopy} />
  </Button>
  /* eslint-enable */
);

export default CopyButton;
