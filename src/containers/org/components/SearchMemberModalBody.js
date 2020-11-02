// @flow
import React from 'react';

import debounce from 'lodash/debounce';
import { faSearch } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PrincipalsApiActions } from 'lattice-sagas';
import { Button, Select, Typography } from 'lattice-ui-kit';
import { useDispatch } from 'react-redux';

import { ModalBody } from '../../../components';

const { SEARCH_ALL_USERS, searchAllUsers } = PrincipalsApiActions;

const SearchMemberModalBody = () => {

  const dispatch = useDispatch();

  const handleOnClick = (e :SyntheticEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('enter', e.currentTarget.value);

  };

  const debounceDispatchSearch = debounce((value) => {
    dispatch(searchAllUsers(value));
  }, 250);

  return (
    <ModalBody>
      <Typography>Enter the username or email address of the person you wish to add to the organization</Typography>
      <form>
        <Select
            hideDropdownIcon
            inputIcon={<FontAwesomeIcon icon={faSearch} />}
            onInputChange={debounceDispatchSearch}
            options={[{ label: 'something', value: 'something' }]} />
        <Button type="submit" onClick={handleOnClick} />
      </form>
    </ModalBody>
  );
};

export default SearchMemberModalBody;
