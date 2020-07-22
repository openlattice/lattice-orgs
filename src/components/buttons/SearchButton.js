/*
 * @flow
 */

import React from 'react';

import { faSearch } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Spinner } from 'lattice-ui-kit';
import type { ButtonProps } from 'lattice-ui-kit';

// 2020-07-17 NOTE: using "disabled" prop instead of "isLoading" because of a margin bug in LUK
const SearchButton = ({
  isLoading = false,
  ...props
} :ButtonProps) => (
  /* eslint-disable react/jsx-props-no-spreading */
  <Button {...props} disabled={isLoading}>
    {
      isLoading && <Spinner />
    }
    {
      !isLoading && <FontAwesomeIcon fixedWidth icon={faSearch} />
    }
  </Button>
  /* eslint-enable */
);

export default SearchButton;
