// @flow
import React, { useState } from 'react';

import { List } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import { ActionModal } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Role, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import AssignRoleModalBody from './AssignRoleModalBody';
import ResetOnUnmount from './ResetOnUnmount';

import { ORGANIZATIONS } from '../../../core/redux/constants';

const { ADD_ROLE_TO_MEMBER, addRoleToMember } = OrganizationsApiActions;

const resetStatePath = [ADD_ROLE_TO_MEMBER];

type Props = {
  isVisible :boolean;
  members :List;
  onClose :() => void;
  organizationId :UUID;
  role :Role;
}

const AssignRoleToMemberModal = ({
  isVisible,
  members,
  onClose,
  organizationId,
  role,
} :Props) => {

  const [memberId, setMemberId] = useState();
  const dispatch = useDispatch();
  const addRoleRS :?RequestState = useRequestState([ORGANIZATIONS, ADD_ROLE_TO_MEMBER]);

  const handleOnClickPrimary = () => {
    dispatch(addRoleToMember({
      memberId,
      organizationId,
      roleId: role.id,
    }));
  };

  const rsComponents = {
    [RequestStates.STANDBY]: (
      <AssignRoleModalBody onChange={setMemberId} members={members} />
    ),
    [RequestStates.SUCCESS]: (
      <ResetOnUnmount
          message="Success!"
          path={resetStatePath} />
    ),
    [RequestStates.FAILURE]: (
      <ResetOnUnmount
          message="Failed to assign the role to the member. Please try again."
          path={resetStatePath} />
    ),
  };

  return (
    <ActionModal
        isVisible={isVisible}
        onClickPrimary={handleOnClickPrimary}
        onClose={onClose}
        requestState={addRoleRS}
        requestStateComponents={rsComponents}
        textPrimary="Assign"
        textTitle={`Assign Role: ${role.title}`}
        viewportScrolling />
  );
};

export default AssignRoleToMemberModal;
