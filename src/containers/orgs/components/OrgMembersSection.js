/*
 * @flow
 */

import React, { Component } from 'react';

import { List, Map, OrderedSet } from 'immutable';
import { Types } from 'lattice';
import { AuthUtils } from 'lattice-auth';
import { OrganizationsApiActions, PrincipalsApiActions } from 'lattice-sagas';
import {
  ActionModal,
  Card,
  MinusButton,
  PlusButton,
  SearchButton,
  SearchInput,
} from 'lattice-ui-kit';
import { LangUtils, Logger } from 'lattice-utils';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { ActionType } from 'lattice';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import { ActionControlWithButton, CompactCardSegment } from './styled';

import * as ReduxActions from '../../../core/redux/ReduxActions';
import * as UsersActions from '../../../core/users/UsersActions';
import { SectionGrid } from '../../../components';
import { INITIAL_SEARCH_RESULTS } from '../../../core/redux/ReduxConstants';
import { getUserId, getUserProfileLabel, sortByProfileLabel } from '../../../utils/PersonUtils';
import type { ResetRequestStateAction } from '../../../core/redux/ReduxActions';

const { ActionTypes } = Types;
const { ADD_MEMBER_TO_ORGANIZATION, REMOVE_MEMBER_FROM_ORGANIZATION } = OrganizationsApiActions;
const { SEARCH_ALL_USERS } = PrincipalsApiActions;
const { isNonEmptyString } = LangUtils;

type OwnProps = {|
  isOwner :boolean;
  org :Map;
|};

type Props = {
  ...OwnProps;
  actions :{
    addMemberToOrganization :RequestSequence;
    removeMemberFromOrganization :RequestSequence;
    resetRequestState :ResetRequestStateAction;
    resetUserSearchResults :() => void;
    searchAllUsers :RequestSequence;
  };
  memberIds :OrderedSet;
  requestStates :{
    ADD_MEMBER_TO_ORGANIZATION :RequestState;
    REMOVE_MEMBER_FROM_ORGANIZATION :RequestState;
    SEARCH_ALL_USERS :RequestState;
  };
  users :Map;
  userSearchResults :Map;
};

type State = {
  isVisibleAddMemberModal :boolean;
  isVisibleRemoveMemberModal :boolean;
  selectedUserId :?string;
  valueOfSearchQuery :?string;
};

const LOG = new Logger('OrgMembersSection');

class OrgMembersSection extends Component<Props, State> {

  state = {
    isVisibleAddMemberModal: false,
    isVisibleRemoveMemberModal: false,
    selectedUserId: undefined,
    valueOfSearchQuery: undefined,
  }

  componentDidUpdate(props :Props) {

    const { actions, requestStates } = this.props;

    if (props.requestStates[ADD_MEMBER_TO_ORGANIZATION] === RequestStates.PENDING
        && requestStates[ADD_MEMBER_TO_ORGANIZATION] === RequestStates.SUCCESS) {
      actions.resetUserSearchResults();
    }

    if (props.requestStates[REMOVE_MEMBER_FROM_ORGANIZATION] === RequestStates.PENDING
        && requestStates[REMOVE_MEMBER_FROM_ORGANIZATION] === RequestStates.SUCCESS) {
      actions.resetUserSearchResults();
    }
  }

  handleOnChangeUserSearch = (event :SyntheticInputEvent<HTMLInputElement>) => {

    const { actions } = this.props;
    const valueOfSearchQuery = event.target.value || '';

    if (!isNonEmptyString(valueOfSearchQuery)) {
      actions.resetUserSearchResults();
    }

    this.setState({
      valueOfSearchQuery,
    });
  }

  handleOnClickAddMember = (event :SyntheticEvent<HTMLElement>) => {

    const { currentTarget } = event;
    if (currentTarget instanceof HTMLElement) {
      const { dataset } = currentTarget;
      if (isNonEmptyString(dataset.userId)) {
        this.setState({
          isVisibleAddMemberModal: true,
          isVisibleRemoveMemberModal: false,
          selectedUserId: dataset.userId,
        });
      }
      else {
        LOG.warn('target is missing expected data attributes: userId', currentTarget);
      }
    }
    else {
      LOG.warn('target is not an HTMLElement', currentTarget);
    }
  }

  handleOnClickRemoveMember = (event :SyntheticEvent<HTMLElement>) => {

    const { currentTarget } = event;
    if (currentTarget instanceof HTMLElement) {
      const { dataset } = currentTarget;
      if (isNonEmptyString(dataset.userId)) {
        this.setState({
          isVisibleAddMemberModal: false,
          isVisibleRemoveMemberModal: true,
          selectedUserId: dataset.userId,
        });
      }
      else {
        LOG.warn('target is missing expected data attributes: userId', currentTarget);
      }
    }
    else {
      LOG.warn('target is not an HTMLElement', currentTarget);
    }
  }

  handleOnKeyDownUserSearch = (event :SyntheticKeyboardEvent<HTMLInputElement>) => {

    switch (event.key) {
      case 'Enter':
        this.searchUsers();
        break;
      default:
        break;
    }
  }

  closeModal = () => {

    const { actions } = this.props;

    this.setState({
      isVisibleAddMemberModal: false,
      isVisibleRemoveMemberModal: false,
      selectedUserId: undefined,
    });

    // the timeout avoids rendering the modal with new state before the transition animation finishes
    setTimeout(() => {
      actions.resetRequestState(ADD_MEMBER_TO_ORGANIZATION);
      actions.resetRequestState(REMOVE_MEMBER_FROM_ORGANIZATION);
    }, 1000);
  }

  addMemberToOrganization = () => {

    const { actions, isOwner, org } = this.props;
    const { selectedUserId } = this.state;

    if (isOwner) {
      actions.addMemberToOrganization({
        memberId: selectedUserId,
        organizationId: org.get('id'),
      });
    }
  }

  removeMemberFromOrganization = () => {

    const { actions, isOwner, org } = this.props;
    const { selectedUserId } = this.state;

    if (isOwner) {
      actions.removeMemberFromOrganization({
        memberId: selectedUserId,
        organizationId: org.get('id'),
      });
    }
  }

  searchUsers = () => {

    const { actions, isOwner } = this.props;
    const { valueOfSearchQuery } = this.state;

    if (isOwner && isNonEmptyString(valueOfSearchQuery)) {
      actions.searchAllUsers(valueOfSearchQuery);
    }
  }

  renderUserSearchResults = () => {

    const { memberIds, userSearchResults } = this.props;
    const { valueOfSearchQuery } = this.state;

    if (INITIAL_SEARCH_RESULTS.equals(userSearchResults) || !isNonEmptyString(valueOfSearchQuery)) {
      return null;
    }

    const searchResultCardSegments = userSearchResults
      .valueSeq()
      .filter((user :Map) => {
        const thisUserInfo :Object = AuthUtils.getUserInfo() || { id: '' };
        const userId :string = getUserId(user);
        return userId !== thisUserInfo.id && !memberIds.has(userId);
      })
      .map((user :Map) => this.renderUserCardSegment(getUserId(user), ActionTypes.ADD));

    if (searchResultCardSegments.isEmpty()) {
      return (
        <div>No matching users found</div>
      );
    }

    return (
      <Card>{searchResultCardSegments}</Card>
    );
  }

  renderUserCardSegment = (userId :string, action :ActionType) => {

    const { isOwner, users } = this.props;

    const user :Map = users.get(userId, Map());
    const userProfileLabel :string = getUserProfileLabel(user) || userId;

    if (action === ActionTypes.ADD) {
      return (
        <CompactCardSegment key={userId}>
          <span title={userProfileLabel}>{userProfileLabel}</span>
          <PlusButton
              disabled={!isOwner}
              data-user-id={userId}
              mode="positive"
              onClick={this.handleOnClickAddMember} />
        </CompactCardSegment>
      );
    }

    if (action === ActionTypes.REMOVE) {
      return (
        <CompactCardSegment key={userId}>
          <span title={userProfileLabel}>{userProfileLabel}</span>
          <MinusButton
              disabled={!isOwner}
              data-user-id={userId}
              mode="negative"
              onClick={this.handleOnClickRemoveMember} />
        </CompactCardSegment>
      );
    }

    return null;
  }

  renderAddMemberModal = () => {

    const { requestStates } = this.props;
    const { isVisibleAddMemberModal } = this.state;

    return (
      <ActionModal
          isVisible={isVisibleAddMemberModal}
          onClickPrimary={this.addMemberToOrganization}
          onClose={this.closeModal}
          requestState={requestStates[ADD_MEMBER_TO_ORGANIZATION]}
          textTitle="Add Member To Organization" />
    );
  }

  renderRemoveMemberModal = () => {

    const { requestStates } = this.props;
    const { isVisibleRemoveMemberModal } = this.state;

    return (
      <ActionModal
          isVisible={isVisibleRemoveMemberModal}
          onClickPrimary={this.removeMemberFromOrganization}
          onClose={this.closeModal}
          requestState={requestStates[REMOVE_MEMBER_FROM_ORGANIZATION]}
          textTitle="Remove Member From Organization" />
    );
  }

  render() {

    const {
      isOwner,
      memberIds,
      requestStates,
    } = this.props;

    const memberCardSegments = memberIds.map(
      (memberId :string) => this.renderUserCardSegment(memberId, ActionTypes.REMOVE)
    );

    return (
      <SectionGrid>
        <h2>Members</h2>
        {
          isOwner && (
            <h4>To add members to this organization, search for users in the system.</h4>
          )
        }
        {
          isOwner && (
            <div>
              <ActionControlWithButton>
                <SearchInput
                    onChange={this.handleOnChangeUserSearch}
                    onKeyDown={this.handleOnKeyDownUserSearch}
                    placeholder="Search users..." />
                <SearchButton
                    isLoading={requestStates[SEARCH_ALL_USERS] === RequestStates.PENDING}
                    onClick={this.searchUsers} />
              </ActionControlWithButton>
            </div>
          )
        }
        {this.renderUserSearchResults()}
        <div>
          {
            memberCardSegments.isEmpty()
              ? (
                <i>No members</i>
              )
              : (
                <Card>{memberCardSegments}</Card>
              )
          }
        </div>
        {this.renderAddMemberModal()}
        {this.renderRemoveMemberModal()}
      </SectionGrid>
    );
  }
}

const mapStateToProps = (state :Map<*, *>, props :OwnProps) => {

  const orgId :UUID = props.org.get('id');
  const memberIds :OrderedSet<string> = state.getIn(['orgs', 'orgMembers', orgId], List())
    .sort(sortByProfileLabel)
    .map((member :Map) => getUserId(member))
    .toOrderedSet();

  return {
    memberIds,
    requestStates: {
      [ADD_MEMBER_TO_ORGANIZATION]: state.getIn(['orgs', ADD_MEMBER_TO_ORGANIZATION, 'requestState']),
      [REMOVE_MEMBER_FROM_ORGANIZATION]: state.getIn(['orgs', REMOVE_MEMBER_FROM_ORGANIZATION, 'requestState']),
      [SEARCH_ALL_USERS]: state.getIn(['users', SEARCH_ALL_USERS, 'requestState']),
    },
    users: state.getIn(['users', 'users'], Map()),
    userSearchResults: state.getIn(['users', 'userSearchResults'], Map()),
  };
};

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    addMemberToOrganization: OrganizationsApiActions.addMemberToOrganization,
    removeMemberFromOrganization: OrganizationsApiActions.removeMemberFromOrganization,
    resetRequestState: ReduxActions.resetRequestState,
    resetUserSearchResults: UsersActions.resetUserSearchResults,
    searchAllUsers: PrincipalsApiActions.searchAllUsers,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgMembersSection);
