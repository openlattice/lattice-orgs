/*
 * @flow
 */
import React from 'react';

import styled from 'styled-components';
import { faSearch } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconButton, SearchInput } from 'lattice-ui-kit';

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
    event.stopPropagation();
    onChange(event.target.value || '');
  };

  return (
    <FormGrid>
      <SearchInput onChange={handleOnChangeUserSearch} placeholder={placeholder} />
      <IconButton isLoading={isPending} onClick={onSearch} type="submit">
        <FontAwesomeIcon fixedWidth icon={faSearch} />
      </IconButton>
    </FormGrid>
  );
};

SearchForm.defaultProps = {
  placeholder: 'Search...',
};

export default SearchForm;
