/*
 * @flow
 */

import React, { useState } from 'react';

import _isFunction from 'lodash/isFunction';
import styled from 'styled-components';
import { SearchInput } from 'lattice-ui-kit';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import { SearchButton } from '../../../components';

const SearchGrid = styled.div`
  align-items: flex-start;
  display: grid;
  flex: 1;
  grid-auto-flow: column;
  grid-gap: 10px;
  grid-template-columns: 1fr auto;

  button {
    line-height: 1.5;
  }
`;

const SearchDataSetsForm = ({
  onSubmit,
  searchRequestState,
} :{|
  onSubmit :(query :string) => void;
  searchRequestState :?RequestState;
|}) => {

  const [query, setQuery] = useState('');

  const handleOnChange = (event :SyntheticInputEvent<HTMLInputElement>) => {
    setQuery(event.target.value || '');
  };

  const handleOnSubmit = (event :SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (_isFunction(onSubmit)) {
      onSubmit(query);
    }
  };

  return (
    <form onSubmit={handleOnSubmit}>
      <SearchGrid>
        <SearchInput onChange={handleOnChange} placeholder="Search data sets" />
        <SearchButton isLoading={searchRequestState === RequestStates.PENDING} color="primary" type="submit" />
      </SearchGrid>
    </form>
  );
};

export default SearchDataSetsForm;
