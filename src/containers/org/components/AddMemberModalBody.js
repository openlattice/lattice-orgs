// @flow
import React from 'react';

import { Typography } from 'lattice-ui-kit';

import SearchMemberBar from './SearchMemberBar';

import { ModalBody } from '../../../components';

type Props = {
  onChange :() => void;
};

const AddMemberModalBody = ({ onChange } :Props) => {
  return (
    <ModalBody>
      <Typography>Enter the username or email address of the person you wish to add to the organiation</Typography>
      <SearchMemberBar onChange={onChange} />
    </ModalBody>
  );
};

export default AddMemberModalBody;
