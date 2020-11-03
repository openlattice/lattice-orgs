/*
 * @flow
 */

import React from 'react';

import { Typography } from 'lattice-ui-kit';

import SearchMemberBar from './SearchMemberBar';

import { ModalBody } from '../../../components';
import type { ReactSelectOption } from '../../../types';

type Props = {
  onChange :(option :?ReactSelectOption) => void;
};

const AddMemberModalBody = ({ onChange } :Props) => (
  <ModalBody>
    <Typography>Enter the username or email address of the person you wish to add to the organization</Typography>
    <SearchMemberBar onChange={onChange} />
  </ModalBody>
);

export default AddMemberModalBody;
