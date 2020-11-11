// @flow
import React, { useMemo } from 'react';

import { List } from 'immutable';
import { AuthUtils } from 'lattice-auth';
import { Select, Typography } from 'lattice-ui-kit';
import { PersonUtils } from 'lattice-utils';

import { ModalBody } from '../../../components';
import { getUserProfileLabel } from '../../../utils/PersonUtils';
import type { ReactSelectOption } from '../../../types';

const { getUserId } = PersonUtils;

type Props = {
  onChange :(value :any) => void;
  members :List;
}
const AssignRoleModalBody = ({ onChange, members } :Props) => {

  const thisUserInfo = AuthUtils.getUserInfo() || { id: '' };
  const thisUserId = thisUserInfo.id;

  const memberOptions = useMemo(() => {
    const options = [];
    members.forEach((member) => {
      options.push({
        label: getUserProfileLabel(member, thisUserId),
        value: getUserId(member)
      });
    });
    return options;
  }, [members, thisUserId]);

  const handleChange = (option :?ReactSelectOption<string>) => {
    onChange(option?.value);
  };

  return (
    <ModalBody>
      <Typography>Enter the username or email address of the member you wish to assign the role to.</Typography>
      <Select
          inputId="assign-to-member"
          isClearable
          options={memberOptions}
          placeholder="Search for member"
          onChange={handleChange} />
    </ModalBody>
  );
};

export default AssignRoleModalBody;
