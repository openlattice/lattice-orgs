/*
 * @flow
 */

import React, { useMemo, useReducer, useState } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { SearchInput, Typography } from 'lattice-ui-kit';
import { useSelector } from 'react-redux';
import type { Role, UUID } from 'lattice';
import { getUserProfile } from '../../utils';
import MemberRoleChip from './MemberRoleChip';
import { CirclePlusButton, StackGrid } from '../../components';
import { AssignRolesToMembersModal, RemoveRoleFromMemberModal } from './components';
import { isRoleAssignedToMember } from './utils';

import { selectCurrentUserIsOrgOwner } from '../../core/redux/selectors';

const Flex = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;

  > a {
    margin-right: 5px;
  }
`;

const INITIAL_STATE :{
  addRoleIsVisible :boolean,
  removeRoleIsVisible :boolean,
  selectedRole ?:Role
} = {
  addRoleIsVisible: false,
  removeRoleIsVisible: false,
  selectedRole: undefined,
};

const CLOSE_ADD_ROLE = 'CLOSE_ADD_ROLE';
const CLOSE_REMOVE_ROLE = 'CLOSE_REMOVE_ROLE';
const OPEN_ADD_ROLE = 'OPEN_ADD_ROLE';
const OPEN_REMOVE_ROLE = 'OPEN_REMOVE_ROLE';

const reducer = (state, action) => {
  switch (action.type) {
    case CLOSE_ADD_ROLE:
      return {
        ...state,
        addRoleIsVisible: false,
      };
    case CLOSE_REMOVE_ROLE:
      return {
        ...state,
        selectedRole: undefined,
        removeRoleIsVisible: false,
      };
    case OPEN_ADD_ROLE:
      return {
        ...state,
        addRoleIsVisible: true,
      };
    case OPEN_REMOVE_ROLE:
      return {
        ...state,
        selectedRole: action.payload,
        removeRoleIsVisible: true,
      };
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
  const memberProfile = getUserProfile(member);
  const members = Map().set(memberProfile.id, memberProfile);
  const isOwner :boolean = useSelector(selectCurrentUserIsOrgOwner(organizationId));
  const [modalState, modalDispatch] = useReducer(reducer, INITIAL_STATE);
  const [searchQuery, setSearchQuery] = useState('');

  const assignedRoles :Role[] = useMemo(() => (
    roles.filter((role) => (
      isRoleAssignedToMember(member, role.id)
      && (!searchQuery.length || role.title.toLowerCase().includes(searchQuery.toLowerCase()))
    ))
  ), [
    member,
    searchQuery,
    roles,
  ]);

  const unassignedRoles :Role[] = useMemo(() => (
    roles.filter((role) => !isRoleAssignedToMember(member, role.id))
  ), [
    member,
    roles,
  ]);

  const handleOnChangeFilterQuery = (event :SyntheticInputEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value || '');
  };

  const handleOpenRemoveRole = (payload) => modalDispatch({ type: OPEN_REMOVE_ROLE, payload });
  const handleCloseRemoveRole = () => modalDispatch({ type: CLOSE_REMOVE_ROLE });
  const handleOpenAddRole = () => modalDispatch({ type: OPEN_ADD_ROLE });
  const handleCloseAddRole = () => modalDispatch({ type: CLOSE_ADD_ROLE });

  return (
    <StackGrid>
      <SearchInput onChange={handleOnChangeFilterQuery} placeholder="Filter roles" />
      <Flex>
        {
          (assignedRoles.length === 0)
            ? (
              <Typography>No roles are assigned to this member.</Typography>
            )
            : (
              assignedRoles.map((role) => (
                <MemberRoleChip
                    key={role.id}
                    onClick={handleOpenRemoveRole}
                    organizationId={organizationId}
                    role={role}
                    authorized={isOwner} />
              ))
            )
        }
        {
          (unassignedRoles.length > 0 && isOwner) && (
            <CirclePlusButton
                onClick={handleOpenAddRole}
                variant="text" />
          )
        }
      </Flex>
      {
        isOwner && (
          <RemoveRoleFromMemberModal
              isVisible={modalState.removeRoleIsVisible}
              member={member}
              onClose={handleCloseRemoveRole}
              organizationId={organizationId}
              role={modalState.selectedRole} />
        )
      }
      {
        isOwner && (
          <AssignRolesToMembersModal
              isVisible={modalState.addRoleIsVisible}
              members={members}
              onClose={handleCloseAddRole}
              organizationId={organizationId}
              roles={unassignedRoles} />
        )
      }
    </StackGrid>
  );
};

export default MemberRolesContainer;
