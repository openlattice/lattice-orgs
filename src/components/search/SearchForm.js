/*
 * @flow
 */
import React from 'react';

import styled from 'styled-components';
import { SearchInput } from 'lattice-ui-kit';

import { SearchButton } from '../buttons';

const FormGrid = styled.form`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: 1fr auto;
`;

type Props = {
  isPending :boolean;
  onChange :(searchQuery :string) => void;
  onSearch :() => void;
  placeholder ?:string;
};

const SearchForm = ({
  isPending,
  onChange,
  onSearch,
  placeholder,
} :Props) => {

  const handleOnChangeUserSearch = (event :SyntheticInputEvent<HTMLInputElement>) => {
    onChange(event.target.value || '');
  };

  return (
    <FormGrid>
      <SearchInput
          onChange={handleOnChangeUserSearch}
          placeholder={placeholder} />
      <SearchButton
          isLoading={isPending}
          onClick={onSearch}
          type="submit" />
    </FormGrid>
  );
};

SearchForm.defaultProps = {
  placeholder: 'Search...',
};

export default SearchForm;
