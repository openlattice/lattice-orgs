// @flow
import React, { useMemo, useReducer } from 'react';

import { Map } from 'immutable';
import { useSelector } from 'react-redux';
import type { Role, UUID } from 'lattice';

import MemberRoleCard from './MemberRoleCard';
import { RemoveRoleFromMemberModal } from './components';
import { isRoleAssignedToMember } from './utils';

import { StackGrid } from '../../components';
import { selectCurrentUserOrgOwner } from '../../core/redux/selectors';

const INITIAL_STATE :{ isVisible :boolean, selectedRole ?:Role } = {
  isVisible: false,
  selectedRole: undefined,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'open': {
      return {
        selectedRole: action.payload,
        isVisible: true
      };
    }
    case 'close':
      return INITIAL_STATE;
    default:
      return state;
  }
};

type Props = {
  member :Map;
  organizationId :UUID;
  roles :Role[];
};

const MemberRolesContainer = ({
  member,
  organizationId,
  roles,
} :Props) => {

  const isOwner :boolean = useSelector(selectCurrentUserOrgOwner(organizationId));
  const [modalState, modalDispatch] = useReducer(reducer, INITIAL_STATE);

  const filteredRoles = useMemo(() => roles.filter((role) => isRoleAssignedToMember(member, role.id)), [member, roles]);

  const handleOpen = (payload) => modalDispatch({ type: 'open', payload });
  const handleClose = () => modalDispatch({ type: 'close' });

  return (
    <StackGrid>
      {
        filteredRoles.map((role) => (
          <MemberRoleCard
              key={role.id}
              onClick={handleOpen}
              organizationId={organizationId}
              role={role} />
        ))
      }
      {
        isOwner && (
          <RemoveRoleFromMemberModal
              isVisible={modalState.isVisible}
              member={member}
              onClose={handleClose}
              organizationId={organizationId}
              role={modalState.selectedRole} />
        )
      }
    </StackGrid>
  );
};

export default MemberRolesContainer;
