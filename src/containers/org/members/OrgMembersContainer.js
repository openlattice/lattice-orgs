/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';
import { faSearch } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map, Set } from 'immutable';
import { Types } from 'lattice';
import { OrganizationsApiActions, PrincipalsApiActions } from 'lattice-sagas';
import {
  AppContentWrapper,
  Button,
  CardSegment,
  CardStack,
  Checkbox,
  IconButton,
  PaginationToolbar,
  SearchInput,
  Spinner,
} from 'lattice-ui-kit';
import { LangUtils, ValidationUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Organization, Role, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  AddOrRemoveMemberRoleModal,
  AddOrRemoveOrgMemberModal,
  AddRoleModal,
  MemberCard,
  NonMemberCard,
} from './components';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  Divider,
  ElementWithButtonGrid,
  Header,
} from '../../../components';
import {
  INITIAL_SEARCH_RESULTS,
  IS_OWNER,
  MEMBERS,
  ORGANIZATIONS,
  USERS,
} from '../../../core/redux/constants';
import { Routes } from '../../../core/router';
import { UsersActions } from '../../../core/users';
import { PersonUtils } from '../../../utils';

const { GET_ORGANIZATION_MEMBERS } = OrganizationsApiActions;
const { SEARCH_ALL_USERS, searchAllUsers } = PrincipalsApiActions;

const { ActionTypes } = Types;
const { isNonEmptyString } = LangUtils;
const { filterUser, getUserId, sortByProfileLabel } = PersonUtils;
const { isValidUUID } = ValidationUtils;
const { resetUserSearchResults } = UsersActions;

const MAX_PER_PAGE = 20;

const ContainerGrid = styled.div`
  display: grid;
  grid-gap: 48px;
  grid-template-columns: 1fr 3fr;
`;

const RolesSection = styled.div`
  display: grid;
  grid-auto-rows: min-content;
  grid-gap: 16px;
  grid-template-columns: 1fr;
  max-width: 288px;
`;

const RolesSectionHeader = styled(Header)`
  justify-content: space-between;
`;

const PeopleSection = styled.section`
  display: grid;
  grid-auto-rows: min-content;
  grid-gap: 32px;
`;

const PeopleSectionControls = styled.div`
  display: grid;
  grid-gap: 8px;
`;

const MEMBERS_DESCRIPTION = 'Members can be granted data permissions on an individual level or by an assigned role.'
  + ' Click on a role to manage its people or datasets.';

type Props = {
  organization :Organization;
  organizationId :UUID;
};

const OrgMembersContainer = ({ organization, organizationId } :Props) => {

  const dispatch = useDispatch();

  const [addOrRemoveMemberRoleAction, setAddOrRemoveMemberRoleAction] = useState();
  const [addOrRemoveOrgMemberAction, setAddOrRemoveOrgMemberAction] = useState();
  const [isVisibleAddRoleModal, setIsVisibleAddRoleModal] = useState(false);
  const [paginationIndex, setPaginationIndex] = useState(0);
  const [paginationPage, setPaginationPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState();
  const [targetMember, setTargetMember] = useState();
  const [targetRole, setTargetRole] = useState<Role | void>();

  const getOrganizationMembersRS :?RequestState = useRequestState([ORGANIZATIONS, GET_ORGANIZATION_MEMBERS]);
  const searchAllUsersRS :?RequestState = useRequestState([USERS, SEARCH_ALL_USERS]);

  const isOwner :boolean = useSelector((s) => s.getIn([ORGANIZATIONS, IS_OWNER, organizationId]));
  const organizationMembers :List = useSelector((s) => s.getIn([ORGANIZATIONS, MEMBERS, organizationId], List()));

  const sortedMembers :List = useMemo(() => (
    organizationMembers.sort(sortByProfileLabel)
  ), [organizationMembers]);

  const sortedFilteredMembers :List = useMemo(() => {
    if (isNonEmptyString(searchQuery) && searchQuery.length > 3) {
      return sortedMembers.filter((member :Map) => filterUser(member, searchQuery));
    }
    return sortedMembers;
  }, [sortedMembers, searchQuery]);

  const memberIds :Set<UUID> = useMemo(() => (
    organizationMembers.map((member) => getUserId(member)).toSet()
  ), [organizationMembers]);

  const userSearchResults :Map = useSelector((s) => s.getIn([USERS, 'userSearchResults'], Map()));
  const searchAttempt = !INITIAL_SEARCH_RESULTS.equals(userSearchResults) && isNonEmptyString(searchQuery);

  const nonMembers = useMemo(() => (
    userSearchResults
      .filter((user) => !memberIds.has(getUserId(user)))
      .toList()
  ), [memberIds, userSearchResults]);

  useEffect(() => () => {
    dispatch(resetUserSearchResults());
  }, []);

  const handleOnChangeUserSearch = (event :SyntheticInputEvent<HTMLInputElement>) => {
    const valueOfSearchQuery = event.target.value || '';
    if (!isNonEmptyString(valueOfSearchQuery)) {
      dispatch(resetUserSearchResults());
    }
    setPaginationIndex(0);
    setPaginationPage(0);
    setSearchQuery(valueOfSearchQuery);
  };

  const handleOnChangeRoleCheckBox = (event :SyntheticEvent<HTMLInputElement>) => {
    const { currentTarget } = event;
    if (currentTarget instanceof HTMLInputElement) {
      const { dataset } = currentTarget;
      const roleId :UUID = dataset.roleId;
      if (isValidUUID(roleId)) {
        if (targetRole && targetRole.id === roleId) {
          setTargetRole();
        }
        else {
          const role = organization.roles.find((r) => r.id === roleId);
          setTargetRole(role);
        }
      }
    }
  };

  const handleOnChangeMemberRoleCheckBox = (member :Map, isChecked :boolean) => {
    setAddOrRemoveMemberRoleAction(isChecked ? ActionTypes.ADD : ActionTypes.REMOVE);
    setTargetMember(member);
  };

  const handleOnClickAddMember = (member :Map) => {
    setAddOrRemoveOrgMemberAction(ActionTypes.ADD);
    setTargetMember(member);
  };

  const handleOnClickRemoveMember = (member :Map) => {
    setAddOrRemoveOrgMemberAction(ActionTypes.REMOVE);
    setTargetMember(member);
  };

  const closeAddOrRemoveOrgMemberModal = () => {
    setAddOrRemoveOrgMemberAction();
    setSearchQuery();
    setTargetMember();
  };

  const closeAddOrRemoveMemberRoleModal = () => {
    setAddOrRemoveMemberRoleAction();
    setTargetMember();
  };

  const handleOnSubmitSearchUsers = (event :SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isOwner && isNonEmptyString(searchQuery)) {
      dispatch(searchAllUsers(searchQuery));
    }
  };

  const filteredOrganizationsCount = sortedFilteredMembers.count();
  const pageMembers = sortedFilteredMembers.slice(
    paginationIndex,
    paginationIndex + MAX_PER_PAGE,
  );

  const handleOnPageChange = ({ page, start }) => {
    setPaginationIndex(start);
    setPaginationPage(page);
  };

  const memberCards = useMemo(() => (
    pageMembers.map((member) => (
      <MemberCard
          isOwner={isOwner}
          key={member.hashCode()}
          member={member}
          onChangeRoleCheckBox={handleOnChangeMemberRoleCheckBox}
          onClickRemoveMember={handleOnClickRemoveMember}
          organizationId={organizationId}
          roleId={targetRole && targetRole.id} />
    ))
  ), [isOwner, organizationId, pageMembers, targetRole]);

  if (getOrganizationMembersRS === RequestStates.PENDING) {
    return (
      <AppContentWrapper>
        <Spinner size="2x" />
      </AppContentWrapper>
    );
  }

  const orgPath = Routes.ORG.replace(Routes.ORG_ID_PARAM, organizationId);

  return (
    <AppContentWrapper>
      <Crumbs>
        <CrumbLink to={orgPath}>{organization.title || 'Organization'}</CrumbLink>
        <CrumbItem>Members</CrumbItem>
      </Crumbs>
      <Header as="h2">Members</Header>
      <span>{MEMBERS_DESCRIPTION}</span>
      <Divider margin={48} />
      <ContainerGrid>
        <RolesSection>
          <RolesSectionHeader as="h4">
            <span>Roles</span>
            {
              isOwner && (
                <Button color="primary" onClick={() => setIsVisibleAddRoleModal(true)} variant="text">
                  + Add Role
                </Button>
              )
            }
          </RolesSectionHeader>
          {
            organization.roles.map((role :Role) => (
              <Checkbox
                  checked={(targetRole && role.id === targetRole.id) || false}
                  data-role-id={role.id}
                  key={role.id}
                  label={role.title}
                  mode="button"
                  onChange={handleOnChangeRoleCheckBox} />
            ))
          }
        </RolesSection>
        <PeopleSection>
          <PeopleSectionControls>
            <form onSubmit={handleOnSubmitSearchUsers}>
              <ElementWithButtonGrid>
                <SearchInput onChange={handleOnChangeUserSearch} placeholder="Filter members or search users..." />
                <IconButton isLoading={searchAllUsersRS === RequestStates.PENDING} type="submit">
                  <FontAwesomeIcon fixedWidth icon={faSearch} />
                </IconButton>
              </ElementWithButtonGrid>
            </form>
          </PeopleSectionControls>
          {
            searchAttempt && nonMembers.isEmpty() && (
              <CardSegment borderless padding="0">
                <i>No users found</i>
              </CardSegment>
            )
          }
          {
            searchAttempt && !nonMembers.isEmpty() && (
              <CardStack>
                {
                  nonMembers.map((nonMember :Map) => (
                    <NonMemberCard
                        isOwner={isOwner}
                        key={nonMember.hashCode()}
                        member={nonMember}
                        onClickAddMember={handleOnClickAddMember} />
                  ))
                }
              </CardStack>
            )
          }
          <CardStack>
            {
              filteredOrganizationsCount > MAX_PER_PAGE && (
                <PaginationToolbar
                    page={paginationPage}
                    count={filteredOrganizationsCount}
                    onPageChange={handleOnPageChange}
                    rowsPerPage={MAX_PER_PAGE} />
              )
            }
            {memberCards}
          </CardStack>
        </PeopleSection>
      </ContainerGrid>
      {
        targetMember && !targetRole && (
          <AddOrRemoveOrgMemberModal
              action={addOrRemoveOrgMemberAction}
              isOwner={isOwner}
              member={targetMember}
              onClose={closeAddOrRemoveOrgMemberModal}
              organizationId={organizationId} />
        )
      }
      {
        targetMember && targetRole && (
          <AddOrRemoveMemberRoleModal
              action={addOrRemoveMemberRoleAction}
              isOwner={isOwner}
              member={targetMember}
              onClose={closeAddOrRemoveMemberRoleModal}
              organizationId={organizationId}
              role={targetRole} />
        )
      }
      {
        isVisibleAddRoleModal && (
          <AddRoleModal
              isOwner={isOwner}
              onClose={() => setIsVisibleAddRoleModal(false)}
              organizationId={organizationId}
              organization={organization} />
        )
      }
    </AppContentWrapper>
  );
};

export default OrgMembersContainer;
