// @flow
import React, { useMemo, useReducer } from 'react';

import { Map } from 'immutable';
import { PaginationToolbar, SearchInput } from 'lattice-ui-kit';
import { useSelector } from 'react-redux';
import type { Role, UUID } from 'lattice';

import MemberRoleCard from './MemberRoleCard';
import { RemoveRoleFromMemberModal } from './components';
import { isRoleAssignedToMember } from './utils';

import { StackGrid } from '../../components';
import { selectCurrentUserOrgOwner } from '../../core/redux/selectors';
import { MAX_HITS_10 } from '../../core/search/constants';
import {
  FILTER,
  INITIAL_PAGINATION_STATE,
  PAGE,
  paginationReducer,
} from '../../utils/stateReducers/pagination';

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
  const [paginationState, paginationDispatch] = useReducer(paginationReducer, INITIAL_PAGINATION_STATE);

  const filteredRoles = useMemo(() => (
    roles.filter((role) => (
      isRoleAssignedToMember(member, role.id)
      && role.title.toLowerCase().includes(paginationState.query.toLowerCase())
    ))
  ), [
    member,
    paginationState.query,
    roles,
  ]);

  const handleOnChangeFilterQuery = (event :SyntheticInputEvent<HTMLInputElement>) => {
    paginationDispatch({ type: FILTER, query: event.target.value || '' });
  };

  const handleOnPageChange = ({ page, start }) => {
    paginationDispatch({ type: PAGE, page, start });
  };

  const handleOpen = (payload) => modalDispatch({ type: 'open', payload });
  const handleClose = () => modalDispatch({ type: 'close' });

  return (
    <StackGrid>
      <SearchInput onChange={handleOnChangeFilterQuery} placeholder="Filter roles" />
      <PaginationToolbar
          count={filteredRoles.length}
          onPageChange={handleOnPageChange}
          page={paginationState.page}
          rowsPerPage={MAX_HITS_10} />
      {
        filteredRoles.map((role) => (
          <MemberRoleCard
              key={role.id}
              onClick={handleOpen}
              organizationId={organizationId}
              role={role}
              isUnassignable={isOwner} />
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