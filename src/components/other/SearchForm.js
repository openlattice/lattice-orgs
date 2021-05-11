/*
 * @flow
 */

import React, { useState } from 'react';

import _isFunction from 'lodash/isFunction';
import { SearchInput } from 'lattice-ui-kit';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import { SearchButton } from '../buttons';
import { ActionsGrid } from '../grids';

const SearchForm = ({
  onSubmit,
  placeholder,
  searchQuery,
  searchRequestState,
} :{|
  onSubmit :(query :string) => void;
  placeholder ?:string;
  searchQuery ?:string;
  searchRequestState :?RequestState;
|}) => {

  const [query, setQuery] = useState(searchQuery || '');

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
      <ActionsGrid>
        <SearchInput onChange={handleOnChange} placeholder={placeholder} value={query} />
        <SearchButton
            aria-label="search button"
            color="primary"
            isPending={searchRequestState === RequestStates.PENDING}
            type="submit">
          Search
        </SearchButton>
      </ActionsGrid>
    </form>
  );
};

SearchForm.defaultProps = {
  placeholder: '',
  searchQuery: '',
};

export default SearchForm;
