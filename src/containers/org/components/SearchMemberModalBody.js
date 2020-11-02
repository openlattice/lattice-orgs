// @flow
import React from 'react';

import { faSearch } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Select, Typography } from 'lattice-ui-kit';

import { ModalBody } from '../../../components';

const SearchMemberModalBody = () => {

  const handleOnClick = (e :SyntheticEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('enter', e.currentTarget.value);

  };

  return (
    <ModalBody>
      <Typography>Enter the username or email address of the person you wish to add to the organization</Typography>
      <form>
        <Select
            hideDropdownIcon
            inputIcon={<FontAwesomeIcon icon={faSearch} />}
            options={[{ label: 'something', value: 'something' }]} />
        <Button type="submit" onClick={handleOnClick} />
      </form>
    </ModalBody>
  );
};

export default SearchMemberModalBody;
