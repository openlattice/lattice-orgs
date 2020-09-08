/*
 * @flow
 */

import React, { useState } from 'react';

import styled from 'styled-components';
import { faTimes } from '@fortawesome/pro-light-svg-icons';
import { faPlus } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import { AuthUtils } from 'lattice-auth';
import {
  Button,
  IconButton,
  PaginationToolbar,
  SearchInput,
} from 'lattice-ui-kit';
import { PersonUtils } from 'lattice-utils';
import type { Role, UUID } from 'lattice';

import RemoveMemberFromOrgModal from './RemoveMemberFromOrgModal';

import { ElementWithButtonGrid, Header } from '../../../../components';
import { getUserProfileLabel } from '../../../../utils/PersonUtils';
import { filterOrganizationMember, isRoleAssignedToMember } from '../../utils';

const { getUserId } = PersonUtils;

const ALL_MEMBERS_HEADER = 'All Members';
const MAX_PER_PAGE = 20;

const MembersSectionGrid = styled.div`
  display: grid;
  grid-auto-rows: min-content;
  grid-gap: 16px;
  grid-template-columns: 1fr;
`;

const MembersSectionHeader = styled(Header)`
  line-height: 48px;
`;

const MemberWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
`;

const PlusIcon = (
  <FontAwesomeIcon fixedWidth icon={faPlus} size="xs" />
);

type Props = {
  isOwner :boolean;
  members :List;
  // organization :Organization;
  organizationId :UUID;
  selectedRole :?Role;
};

const MembersSection = ({
  isOwner,
  members,
  organizationId,
  selectedRole,
} :Props) => {

  const [isVisibleRemoveMemberFromOrgModal, setIsVisibleRemoveMemberFromOrgModal] = useState();
  const [memberFilterQuery, setMemberFilterQuery] = useState('');
  const [memberToRemove, setMemberToRemove] = useState();
  const [paginationIndex, setPaginationIndex] = useState(0);
  const [paginationPage, setPaginationPage] = useState(0);

  const handleOnClickRemoveMember = (member :Map) => {
    setMemberToRemove(member);
    setIsVisibleRemoveMemberFromOrgModal(true);
  };

  const handleOnChangeMemberFilterQuery = (event :SyntheticInputEvent<HTMLInputElement>) => {
    setPaginationIndex(0);
    setPaginationPage(0);
    setMemberFilterQuery(event.target.value || '');
  };

  const handleOnPageChange = ({ page, start }) => {
    setPaginationIndex(start);
    setPaginationPage(page);
  };

  const thisUserInfo = AuthUtils.getUserInfo() || { id: '' };
  const thisUserId = thisUserInfo.id;
  const memberIdToRemove = getUserId(memberToRemove);

  let filteredMembers = members;
  let memberSectionHeader = ALL_MEMBERS_HEADER;
  if (selectedRole) {
    filteredMembers = filteredMembers.filter((member) => isRoleAssignedToMember(member, selectedRole.id));
    memberSectionHeader = selectedRole.title;
  }
  if (memberFilterQuery) {
    filteredMembers = filteredMembers.filter((member) => filterOrganizationMember(member, memberFilterQuery));
  }
  const filteredMembersCount = filteredMembers.count();
  const pageMembers = filteredMembers.slice(paginationIndex, paginationIndex + MAX_PER_PAGE);

  return (
    <MembersSectionGrid>
      <MembersSectionHeader as="h4">{memberSectionHeader}</MembersSectionHeader>
      <ElementWithButtonGrid>
        <SearchInput onChange={handleOnChangeMemberFilterQuery} placeholder="Filter members" />
        <Button color="primary" startIcon={PlusIcon}>Add Member</Button>
      </ElementWithButtonGrid>
      {
        filteredMembersCount > MAX_PER_PAGE && (
          <PaginationToolbar
              page={paginationPage}
              count={filteredMembersCount}
              onPageChange={handleOnPageChange}
              rowsPerPage={MAX_PER_PAGE} />
        )
      }
      {
        pageMembers.map((member) => {
          const userId = getUserId(member);
          return (
            <MemberWrapper key={userId}>
              <span>{getUserProfileLabel(member, thisUserId)}</span>
              <IconButton onClick={() => handleOnClickRemoveMember(member)}>
                <FontAwesomeIcon fixedWidth icon={faTimes} />
              </IconButton>
            </MemberWrapper>
          );
        })
      }
      {
        isOwner && isVisibleRemoveMemberFromOrgModal && memberIdToRemove && (
          <RemoveMemberFromOrgModal
              member={getUserProfileLabel(memberToRemove)}
              memberId={memberIdToRemove}
              onClose={() => setIsVisibleRemoveMemberFromOrgModal(false)}
              organizationId={organizationId} />
        )
      }
    </MembersSectionGrid>
  );
};

export default MembersSection;
