/*
 * @flow
 */

import React, { useMemo, useReducer } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { PaginationToolbar, SearchInput, Typography } from 'lattice-ui-kit';
import { useSelector } from 'react-redux';
import type { Role, UUID } from 'lattice';

import MemberRoleCard from './MemberRoleCard';
import { RemoveRoleFromMemberModal } from './components';
import { isRoleAssignedToMember } from './utils';

import { StackGrid } from '../../components';
import { selectCurrentUserIsOrgOwner } from '../../core/redux/selectors';
import { MAX_HITS_10 } from '../../core/search/constants';
import {
  FILTER,
  INITIAL_PAGINATION_STATE,
  PAGE,
  paginationReducer,
} from '../../utils/stateReducers/pagination';

const Flex = styled.div`
  display: flex;
`;

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

  const isOwner :boolean = useSelector(selectCurrentUserIsOrgOwner(organizationId));
  const [modalState, modalDispatch] = useReducer(reducer, INITIAL_STATE);
  const [paginationState, paginationDispatch] = useReducer(paginationReducer, INITIAL_PAGINATION_STATE);

  const filteredRoles :Role[] = useMemo(() => (
    roles.filter((role) => (
      isRoleAssignedToMember(member, role.id)
      && role.title.toLowerCase().includes(paginationState.query.toLowerCase())
    ))
  ), [
    member,
    paginationState.query,
    roles,
  ]);

  if (filteredRoles.length === 0) {
    return (
      <Typography>No roles are assigned to this member.</Typography>
    );
  }

  const pagedRoles :Role[] = filteredRoles.slice(paginationState.start, paginationState.start + MAX_HITS_10);

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
      <Flex>
        {
          pagedRoles.map((role) => (
            <MemberRoleCard
                key={role.id}
                onClick={handleOpen}
                organizationId={organizationId}
                role={role}
                isUnassignable={isOwner} />
          ))
        }
      </Flex>
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
