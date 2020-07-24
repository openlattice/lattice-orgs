/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import { List, Map, Set } from 'immutable';
import { Types } from 'lattice';
import { AuthUtils } from 'lattice-auth';
import { OrganizationsApiActions, PrincipalsApiActions } from 'lattice-sagas';
import {
  ActionModal,
  AppContentWrapper,
  Card,
  CardSegment,
  Label,
  Spinner,
} from 'lattice-ui-kit';
import { LangUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { UserCardSegment } from './components';

import { Header, SearchForm } from '../../components';
import { ReduxActions } from '../../core/redux';
import { INITIAL_SEARCH_RESULTS, MEMBERS, REDUCERS } from '../../core/redux/constants';
import { UsersActions } from '../../core/users';
import { PersonUtils } from '../../utils';

const { ActionTypes } = Types;
const {
  ADD_MEMBER_TO_ORGANIZATION,
  GET_ORGANIZATION_MEMBERS,
  REMOVE_MEMBER_FROM_ORGANIZATION,
  addMemberToOrganization,
  getOrganizationMembers,
  removeMemberFromOrganization,
} = OrganizationsApiActions;
const {
  SEARCH_ALL_USERS,
  searchAllUsers,
} = PrincipalsApiActions;

const { isNonEmptyString } = LangUtils;
const { getUserId } = PersonUtils;
const { resetRequestState } = ReduxActions;
const { resetUserSearchResults } = UsersActions;

type Props = {
  isOwner :boolean;
  organizationId :UUID;
};

const OrgMembersContainer = ({ isOwner, organizationId } :Props) => {

  const dispatch = useDispatch();
  const [isVisibleAddModal, setIsVisibleAddModal] = useState(false);
  const [isVisibleRemoveModal, setIsVisibleRemoveModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState();
  const [searchQuery, setSearchQuery] = useState();

  const getOrganizationMembersRS :?RequestState = useRequestState([REDUCERS.ORGS, GET_ORGANIZATION_MEMBERS]);
  const addMemberRS :?RequestState = useRequestState([REDUCERS.ORGS, ADD_MEMBER_TO_ORGANIZATION]);
  const removeMemberRS :?RequestState = useRequestState([REDUCERS.ORGS, REMOVE_MEMBER_FROM_ORGANIZATION]);
  const searchAllUsersRS :?RequestState = useRequestState([REDUCERS.USERS, SEARCH_ALL_USERS]);

  const members :List = useSelector((s) => s.getIn([REDUCERS.ORGS, MEMBERS, organizationId], List()));
  const userSearchResults :Map = useSelector((s) => s.getIn([REDUCERS.USERS, 'userSearchResults'], Map()));

  const memberIds :Set<UUID> = useMemo(() => (
    members.map((member) => getUserId(member)).toSet()
  ), [members]);

  const nonMembers = useMemo(() => (
    userSearchResults
      .filter((user :Map) => {
        const thisUserInfo :Object = AuthUtils.getUserInfo() || {};
        const userId :string = getUserId(user);
        return userId !== thisUserInfo.id && !memberIds.has(userId);
      })
      .toList()
  ), [memberIds, userSearchResults]);

  useEffect(() => {
    // TODO: this is called on every mount
    // TODO: move this to initializeOrganization
    dispatch(getOrganizationMembers(organizationId));
  }, [dispatch, organizationId]);

  useEffect(() => () => {
    dispatch(resetUserSearchResults());
  }, []);

  if (getOrganizationMembersRS === RequestStates.PENDING) {
    return (
      <AppContentWrapper>
        <Spinner size="2x" />
      </AppContentWrapper>
    );
  }

  const handleOnChangeUserSearch = (valueOfSearchQuery :string) => {
    if (!isNonEmptyString(valueOfSearchQuery)) {
      dispatch(resetUserSearchResults());
    }
    setSearchQuery(valueOfSearchQuery);
  };

  const handleOnClickAddMember = (userId :string) => {
    setIsVisibleAddModal(true);
    setIsVisibleRemoveModal(false);
    setSelectedUserId(userId);
  };

  const handleOnClickRemoveMember = (userId :string) => {
    setIsVisibleAddModal(false);
    setIsVisibleRemoveModal(true);
    setSelectedUserId(userId);
  };

  const addMember = () => {
    if (isOwner) {
      dispatch(
        addMemberToOrganization({
          organizationId,
          memberId: selectedUserId,
          user: nonMembers.find((m) => getUserId(m) === selectedUserId)
        })
      );
    }
    setSelectedUserId();
  };

  const removeMember = () => {
    if (isOwner) {
      dispatch(
        removeMemberFromOrganization({
          organizationId,
          memberId: selectedUserId,
        })
      );
    }
    setSelectedUserId();
  };

  const closeModal = () => {

    setIsVisibleAddModal(false);
    setIsVisibleRemoveModal(false);
    setSelectedUserId();

    // the timeout avoids rendering the modal with new state before the transition animation finishes
    setTimeout(() => {
      dispatch(resetRequestState([ADD_MEMBER_TO_ORGANIZATION]));
      dispatch(resetRequestState([REMOVE_MEMBER_FROM_ORGANIZATION]));
    }, 1000);
  };

  const searchUsers = () => {
    if (isOwner && isNonEmptyString(searchQuery)) {
      dispatch(searchAllUsers(searchQuery));
    }
  };

  const searchAttempt = !INITIAL_SEARCH_RESULTS.equals(userSearchResults) && isNonEmptyString(searchQuery);

  return (
    <AppContentWrapper>
      {
        isOwner && (
          <CardSegment borderless padding="0 0 30px 0">
            <CardSegment borderless padding="0 0 30px 0">
              <Label>To add members to this organization, search for users in the system.</Label>
              <SearchForm
                  isPending={searchAllUsersRS === RequestStates.PENDING}
                  onChange={handleOnChangeUserSearch}
                  onSearch={searchUsers}
                  placeholder="Search users..." />
            </CardSegment>
            {
              searchAttempt && nonMembers.isEmpty() && (
                <CardSegment borderless padding="0">
                  <i>No users found</i>
                </CardSegment>
              )
            }
            {
              searchAttempt && !nonMembers.isEmpty() && (
                <Card>
                  {
                    nonMembers.map((nonMember) => (
                      <UserCardSegment
                          action={ActionTypes.ADD}
                          isOwner={isOwner}
                          key={nonMember.hashCode()}
                          onClick={handleOnClickAddMember}
                          user={nonMember} />
                    ))
                  }
                </Card>
              )
            }
          </CardSegment>
        )
      }
      <Header as="h3">Members</Header>
      {
        members.isEmpty()
          ? (
            <i>No members</i>
          )
          : (
            <Card>
              {
                members.map((member) => (
                  <UserCardSegment
                      action={ActionTypes.REMOVE}
                      isOwner={isOwner}
                      key={member.hashCode()}
                      onClick={handleOnClickRemoveMember}
                      user={member} />
                ))
              }
            </Card>
          )
      }
      <ActionModal
          isVisible={isVisibleAddModal}
          onClickPrimary={addMember}
          onClose={closeModal}
          requestState={addMemberRS}
          textTitle="Add Member To Organization" />
      <ActionModal
          isVisible={isVisibleRemoveModal}
          onClickPrimary={removeMember}
          onClose={closeModal}
          requestState={removeMemberRS}
          textTitle="Remove Member From Organization" />
    </AppContentWrapper>
  );
};

// const requestStateComponents = {
//   [RequestStates.STANDBY]: (
//     <ModalBodyMinWidth>
//       <Label htmlFor="new-org-title">Organization title*</Label>
//       <Input
//           id="new-org-title"
//           error={!isValidOrgTitle}
//           onChange={this.handleOnChangeNewOrgTitle}
//           value={newOrgTitle} />
//     </ModalBodyMinWidth>
//   ),
//   [RequestStates.FAILURE]: (
//     <ModalBodyMinWidth>
//       <span>Failed to create the organization. Please try again.</span>
//     </ModalBodyMinWidth>
//   ),
// };

export default OrgMembersContainer;
