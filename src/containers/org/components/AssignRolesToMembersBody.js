// @flow

import React, { useState } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { ModalFooter } from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import type { Role, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import SelectRoles from './SelectRoles';

import ResetOnUnmount from '../../../components/other/ResetOnUnmount';
import StepConfirm from '../../permissions/StepConfirm';
import { ModalBody, StepsController } from '../../../components';
import { ORGANIZATIONS } from '../../../core/redux/constants';
import { getUserProfile } from '../../../utils';
import { ASSIGN_ROLES_TO_MEMBERS, assignRolesToMembers } from '../actions';

const { isPending, isSuccess } = ReduxUtils;

const resetStatePath = [[ASSIGN_ROLES_TO_MEMBERS]];

const StyledFooter = styled(ModalFooter)`
  padding: 16px 0 30px;
`;

type Props = {
  onClose :() => void;
  members :Map;
  roles :Role[];
  organizationId :UUID;
};

const AssignRolesToMembersModalBody = ({
  members,
  onClose,
  organizationId,
  roles,
} :Props) => {
  const dispatch = useDispatch();
  const requestState :?RequestState = useRequestState([ORGANIZATIONS, ASSIGN_ROLES_TO_MEMBERS]);
  const [selectedRoles, setSelectedRoles] = useState(Map());

  const pending = isPending(requestState);
  const success = isSuccess(requestState);

  const handleSelectRole = (role :Role) => {
    const { id } = role;
    const newSelection = selectedRoles.has(id)
      ? selectedRoles.remove(id)
      : selectedRoles.set(id, role);
    setSelectedRoles(newSelection);
  };

  const handleSave = () => {
    dispatch(assignRolesToMembers({
      organizationId,
      roles: selectedRoles,
      members,
    }));
  };

  const { name, email } = getUserProfile(members.first());
  const membersText = members.size === 1
    ? (name || email)
    : `${members.size} users`;

  const confirmText = `Add ${selectedRoles.size} role(s) to ${membersText}?`;
  const successText = `${selectedRoles.size} roles were added to ${membersText}.`;

  return (
    <StepsController>
      {
        ({ step, stepBack, stepNext }) => (
          <>
            {
              step === 0 && (
                <>
                  <ModalBody>
                    <SelectRoles
                        members={members}
                        onClick={handleSelectRole}
                        roles={roles}
                        selectedRoles={selectedRoles} />
                  </ModalBody>
                  <StyledFooter
                      isDisabledPrimary={!selectedRoles.size}
                      onClickPrimary={stepNext}
                      shouldStretchButtons
                      textPrimary="Continue" />
                </>
              )
            }
            {
              step === 1 && (
                <>
                  <ModalBody>
                    <ResetOnUnmount paths={resetStatePath}>
                      <StepConfirm
                          confirmText={confirmText}
                          requestState={requestState}
                          successText={successText} />
                    </ResetOnUnmount>
                  </ModalBody>
                  <StyledFooter
                      isPendingPrimary={pending}
                      onClickPrimary={success ? onClose : handleSave}
                      onClickSecondary={stepBack}
                      shouldStretchButtons
                      textPrimary={success ? 'Close' : 'Save'}
                      textSecondary={success ? '' : 'Back'} />
                </>
              )
            }
          </>
        )
      }
    </StepsController>
  );
};

export default AssignRolesToMembersModalBody;
