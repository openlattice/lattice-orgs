/*
 * @flow
 */

import React, { useState } from 'react';

import { Map } from 'immutable';
import { useRequestState, useStepState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import type { Role, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import BulkRoleSelectionStep from './BulkRoleSelectionStep';
import ConfirmStepBody from './ConfirmStepBody';

import { ORGANIZATIONS } from '../../../core/redux/constants';
import { getUserProfile } from '../../../utils';
import { REVOKE_ROLES_FROM_MEMBERS, revokeRolesFromMembers } from '../actions';

const RESET_ACTIONS = [REVOKE_ROLES_FROM_MEMBERS];

type Props = {
  members :Map;
  onClose :() => void;
  organizationId :UUID;
  roles :Role[];
};

const RevokeRolesFromMembersModalBody = ({
  members,
  onClose,
  organizationId,
  roles,
} :Props) => {
  const dispatch = useDispatch();
  const [step, stepBack, stepNext] = useStepState(2);
  const requestState :?RequestState = useRequestState([ORGANIZATIONS, REVOKE_ROLES_FROM_MEMBERS]);
  const [selectedRoles, setSelectedRoles] = useState(Map());

  const handleSelectRole = (role :Role) => {
    const { id } = role;
    const newSelection = selectedRoles.has(id)
      ? selectedRoles.remove(id)
      : selectedRoles.set(id, role);
    setSelectedRoles(newSelection);
  };

  const handleSave = () => {
    dispatch(revokeRolesFromMembers({
      organizationId,
      roles: selectedRoles,
      members,
    }));
  };

  const { name, email } = getUserProfile(members.first());
  const membersText = members.size === 1
    ? (name || email)
    : `${members.size} users`;

  const confirmMessage = `Remove ${selectedRoles.size} role(s) from ${membersText}?`;
  const successMessage = `${selectedRoles.size} roles were removed from ${membersText}.`;

  return (
    <>
      {
        step === 0 && (
          <BulkRoleSelectionStep
              members={members}
              onNext={stepNext}
              onSelectRole={handleSelectRole}
              roles={roles}
              selectedRoles={selectedRoles} />
        )
      }
      {
        step === 1 && (
          <ConfirmStepBody
              actionText="Remove"
              actions={RESET_ACTIONS}
              confirmMessage={confirmMessage}
              onBack={stepBack}
              onClose={onClose}
              onConfirm={handleSave}
              requestState={requestState}
              successMessage={successMessage} />
        )
      }
    </>
  );
};

export default RevokeRolesFromMembersModalBody;
