/*
 * @flow
 */

import React, { useState } from 'react';

import _isFunction from 'lodash/isFunction';
import { SearchInput } from 'lattice-ui-kit';

import { SearchButton } from '../buttons';
import { ActionsGrid } from '../grids';

const SearchForm = ({
  isPending,
  onSubmit,
  placeholder,
  searchQuery,
} :{|
  isPending :boolean;
  onSubmit :(query :string) => void;
  placeholder ?:string;
  searchQuery ?:string;
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
            isPending={isPending}
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
