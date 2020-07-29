/*
 * @flow
 */

import React from 'react';

import { faMinus } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Spinner } from 'lattice-ui-kit';

// 2020-07-17 NOTE: using "disabled" prop instead of "isLoading" because of a margin bug in LUK
const MinusButton = ({
  color = 'error',
  disabled = false,
  isLoading = false,
  variant = 'outlined',
  ...props
} :Object) => (
  /* eslint-disable react/jsx-props-no-spreading */
  <Button {...props} color={color} disabled={disabled || isLoading} variant={variant}>
    {
      isLoading && <Spinner />
    }
    {
      !isLoading && <FontAwesomeIcon fixedWidth icon={faMinus} />
    }
  </Button>
  /* eslint-enable */
);

export default MinusButton;
