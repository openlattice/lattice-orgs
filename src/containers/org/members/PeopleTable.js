// @flow
import React, { useReducer, useState } from 'react';

import styled from 'styled-components';
import { faAngleDown, faPlus } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import {
  Button,
  Checkbox,
  Colors,
  PaginationToolbar,
  SearchInput,
} from 'lattice-ui-kit';
import type { Role, UUID } from 'lattice';

import FilterButton from './components/FilterButton';
import TableRow from './components/TableRow';

import AddMemberToOrgModal from '../components/AddMemberToOrgModal';
import { getUserProfile } from '../../../utils';
import {
  FILTER,
  INITIAL_PAGINATION_STATE,
  PAGE,
  paginationReducer
} from '../../../utils/stateReducers/pagination';
import { RemoveMemberFromOrgModal, RemoveRoleFromMemberModal } from '../components';
import { filterOrganizationMember } from '../utils';

const { NEUTRAL } = Colors;

const TableToolbar = styled.div`
  align-items: center;
  display: grid;
  grid-gap: 8px;
  grid-template-columns: minmax(160px, max-content) 160px 1fr 100px 160px;
  margin: 16px 0;
`;

const MembersCheckboxWrapper = styled.div`
  margin: 0 8px 0 17px;
`;

const Table = styled.table`
  border: 1px solid ${NEUTRAL.N100};
  border-collapse: collapse;
  width: 100%;
`;

const Selection = styled.span`
  margin-left: 10px;
  vertical-align: middle;
`;

const PlusIcon = <FontAwesomeIcon icon={faPlus} size="lg" />;

const ChevronDown = <FontAwesomeIcon icon={faAngleDown} />;

const MAX_PER_PAGE = 20;

type Props = {
  isOwner :boolean;
  members :List;
  organizationId :UUID;
  roles :Role[];
};

const PeopleTable = ({
  isOwner,
  members,
  roles,
  organizationId,
} :Props) => {

  // consider using reducers for handling member/role/action selection
  const [isVisibleRemoveMemberFromOrgModal, setIsVisibleRemoveMemberFromOrgModal] = useState(false);
  const [isVisibleRemoveRoleFromMemberModal, setIsVisibleRemoveRoleFromMemberModal] = useState(false);
  const [isVisibleAddMemberToOrgModal, setIsVisibleAddMemberToOrgModal] = useState(false);
  const [isVisibleAssignRoleModal, setIsVisibleAssignRoleModal] = useState(false);
  const [paginationState, paginationDispatch] = useReducer(paginationReducer, INITIAL_PAGINATION_STATE);
  const [targetMember, setTargetMember] = useState();
  const [targetRole, setTargetRole] = useState();

  let filteredMembers = members;
  if (paginationState.query) {
    filteredMembers = filteredMembers.filter((member) => filterOrganizationMember(member, paginationState.query));
  }
  const filteredMembersCount = filteredMembers.count();
  const pageMembers = filteredMembers.slice(paginationState.start, paginationState.start + MAX_PER_PAGE);

  const handleOnPageChange = ({ page, start }) => {
    paginationDispatch({ type: PAGE, page, start });
  };

  const handleOnChangeMemberFilterQuery = (event :SyntheticInputEvent<HTMLInputElement>) => {
    paginationDispatch({ type: FILTER, query: event.target.value || '' });
  };

  const handleUnassignRole = (member :Map, role :Role) => {
    setTargetMember(member);
    setTargetRole(role);
    setIsVisibleRemoveRoleFromMemberModal(true);
  };

  const handleUnassignAllRoles = () => {

  };

  const handleRemoveMember = (member :Map) => {
    setTargetMember(member);
    setIsVisibleRemoveMemberFromOrgModal(true);
  };

  const handleAddMember = () => {
    setIsVisibleAddMemberToOrgModal(true);
  };

  const handleOnFilterChange = (category :string, value :string) => {
    // update state to toggle inclusion of set
  };

  return (
    <div>
      <TableToolbar>
        <MembersCheckboxWrapper>
          <Checkbox />
          <Selection>{`${members.size} members`}</Selection>
        </MembersCheckboxWrapper>
        <Button endIcon={ChevronDown} variant="text">Bulk Actions</Button>
        <SearchInput onChange={handleOnChangeMemberFilterQuery} />
        {/* <Button endIcon={ChevronDown} variant="text">Filter</Button> */}
        <FilterButton
            onFilterChange={handleOnFilterChange}
            organizationId={organizationId}
            roles={roles} />
        <Button
            color="primary"
            onClick={handleAddMember}
            startIcon={PlusIcon}>
          Add Member
        </Button>
      </TableToolbar>
      <Table cellPadding="0" cellSpacing="0">
        <colgroup>
          <col width="56px" />
          <col width="268px" />
          <col width="150px" />
        </colgroup>
        <tbody>
          {
            pageMembers.map((member) => {
              const { id } = getUserProfile(member);
              return (
                <TableRow
                    isOwner={isOwner}
                    key={id}
                    member={member}
                    onUnassign={handleUnassignRole}
                    onUnassignAll={handleUnassignAllRoles}
                    onRemoveMember={handleRemoveMember}
                    organizationId={organizationId}
                    roles={roles} />
              );
            })
          }
        </tbody>
      </Table>
      <PaginationToolbar
          count={filteredMembersCount}
          onPageChange={handleOnPageChange}
          page={paginationState.page}
          rowsPerPage={MAX_PER_PAGE} />
      {
        isOwner && targetRole && (
          <RemoveRoleFromMemberModal
              isVisible={isVisibleRemoveRoleFromMemberModal}
              member={targetMember}
              onClose={() => setIsVisibleRemoveRoleFromMemberModal(false)}
              organizationId={organizationId}
              role={targetRole} />
        )
      }
      {
        isOwner && (
          <AddMemberToOrgModal
              isVisible={isVisibleAddMemberToOrgModal}
              member={targetMember}
              onClose={() => setIsVisibleAddMemberToOrgModal(false)}
              organizationId={organizationId} />
        )
      }
      {
        isOwner && (
          <RemoveMemberFromOrgModal
              isVisible={isVisibleRemoveMemberFromOrgModal}
              member={targetMember}
              onClose={() => setIsVisibleRemoveMemberFromOrgModal(false)}
              organizationId={organizationId} />
        )
      }
    </div>

  );
};

PeopleTable.defaultProps = {
  members: List()
};

export default PeopleTable;
