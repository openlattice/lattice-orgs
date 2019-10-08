/*
 * @flow
 */

import React, { Component } from 'react';

import { List, Map } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import {
  Card,
  MinusButton,
  PlusButton,
  SearchButton,
  SearchInput,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import * as OrgsActions from '../OrgsActions';
import * as ReduxActions from '../../../core/redux/ReduxActions';
import {
  ActionControlWithButton,
  CompactCardSegment,
  OrgDetailSectionGrid,
  OrgDetailSectionGridItem,
  SpinnerOverlayCard,
} from './styled';
import { isNonEmptyString } from '../../../utils/LangUtils';
import { getUserProfileLabel } from '../../../utils/PersonUtils';

const {
  ADD_MEMBER_TO_ORG,
  REMOVE_MEMBER_FROM_ORG,
} = OrganizationsApiActions;

const {
  SEARCH_MEMBERS_TO_ADD_TO_ORG,
} = OrgsActions;

const MEMBERS_SUB_TITLE = `
Click on a member to view their roles. To add members to this organization, search for users in the system.
`;

type Props = {
  actions :{
    addMemberToOrganization :RequestSequence;
    removeMemberFromOrganization :RequestSequence;
    resetRequestState :(actionType :string) => void;
    searchMembersToAddToOrg :RequestSequence;
  };
  isOwner :boolean;
  memberSearchResults :Map;
  org :Map;
  requestStates :{
    ADD_MEMBER_TO_ORG :RequestState;
    REMOVE_MEMBER_FROM_ORG :RequestState;
    SEARCH_MEMBERS_TO_ADD_TO_ORG :RequestState;
  };
};

type State = {
  valueOfSearchQuery :string;
};

class OrgMembersSection extends Component<Props, State> {

  state = {
    valueOfSearchQuery: '',
  }

  handleOnChangeMemberSearch = (event :SyntheticInputEvent<HTMLInputElement>) => {

    const { actions, isOwner, org } = this.props;
    const valueOfSearchQuery = event.target.value || '';

    if (isOwner) {
      actions.searchMembersToAddToOrg({
        organizationId: org.get('id'),
        query: valueOfSearchQuery,
      });
      this.setState({ valueOfSearchQuery });
    }
  }

  handleOnClickAddMember = (memberId :string) => {

    const { actions, isOwner, org } = this.props;

    if (isOwner) {
      actions.addMemberToOrganization({
        memberId,
        organizationId: org.get('id'),
      });
    }
  }

  handleOnClickRemoveMember = (memberId :string) => {

    const { actions, isOwner, org } = this.props;

    if (isOwner) {
      actions.removeMemberFromOrganization({
        memberId,
        organizationId: org.get('id'),
      });
    }
  }

  handleOnClickSearch = () => {

    const { actions, isOwner, org } = this.props;
    const { valueOfSearchQuery } = this.state;

    if (isOwner && isNonEmptyString(valueOfSearchQuery)) {
      actions.searchMembersToAddToOrg({
        organizationId: org.get('id'),
        query: valueOfSearchQuery,
      });
    }
  }

  render() {

    const {
      isOwner,
      org,
      memberSearchResults,
      requestStates,
    } = this.props;
    const { valueOfSearchQuery } = this.state;

    const members = org.get('members', List());
    const memberCardSegments = members.map((member :Map) => {
      const userProfileLabel :string = getUserProfileLabel(member);
      const memberId :string = member.getIn(['profile', 'user_id'], member.get('id'));
      return (
        <CompactCardSegment key={memberId || userProfileLabel}>
          <span title={userProfileLabel}>{userProfileLabel}</span>
          {
            isOwner && (
              <MinusButton mode="negative" onClick={() => this.handleOnClickRemoveMember(memberId)} />
            )
          }
        </CompactCardSegment>
      );
    });

    const searchResultCardSegments = memberSearchResults.valueSeq().map((member :Map) => {
      const userProfileLabel :string = getUserProfileLabel(member);
      return (
        <CompactCardSegment key={member.get('user_id')}>
          <span title={userProfileLabel}>{userProfileLabel}</span>
          <PlusButton
              isLoading={requestStates[ADD_MEMBER_TO_ORG] === RequestStates.PENDING}
              mode="positive"
              onClick={() => this.handleOnClickAddMember(member.get('user_id'))} />
        </CompactCardSegment>
      );
    });

    return (
      <OrgDetailSectionGrid>
        <h2>Members</h2>
        {
          isOwner && (
            <h4>{MEMBERS_SUB_TITLE}</h4>
          )
        }
        {
          isOwner && (
            <OrgDetailSectionGridItem>
              <ActionControlWithButton>
                <SearchInput
                    onChange={this.handleOnChangeMemberSearch}
                    placeholder="Search for a member to add" />
                <SearchButton
                    isLoading={requestStates[SEARCH_MEMBERS_TO_ADD_TO_ORG] === RequestStates.PENDING}
                    onClick={this.handleOnClickSearch} />
              </ActionControlWithButton>
            </OrgDetailSectionGridItem>
          )
        }
        {
          isOwner && isNonEmptyString(valueOfSearchQuery) && !searchResultCardSegments.isEmpty() && (
            <OrgDetailSectionGridItem>
              <Card>{searchResultCardSegments}</Card>
            </OrgDetailSectionGridItem>
          )
        }
        <OrgDetailSectionGridItem>
          {
            memberCardSegments.isEmpty()
              ? (
                <i>No members</i>
              )
              : (
                <Card>{memberCardSegments}</Card>
              )
          }
          {
            !memberCardSegments.isEmpty() && requestStates[REMOVE_MEMBER_FROM_ORG] === RequestStates.PENDING && (
              <SpinnerOverlayCard />
            )
          }
        </OrgDetailSectionGridItem>
      </OrgDetailSectionGrid>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => ({
  memberSearchResults: state.getIn(['orgs', 'memberSearchResults'], Map()),
  requestStates: {
    [ADD_MEMBER_TO_ORG]: state.getIn(['orgs', ADD_MEMBER_TO_ORG, 'requestState']),
    [REMOVE_MEMBER_FROM_ORG]: state.getIn(['orgs', REMOVE_MEMBER_FROM_ORG, 'requestState']),
    [SEARCH_MEMBERS_TO_ADD_TO_ORG]: state.getIn(['orgs', SEARCH_MEMBERS_TO_ADD_TO_ORG, 'requestState']),
  },
});

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    addMemberToOrganization: OrganizationsApiActions.addMemberToOrganization,
    removeMemberFromOrganization: OrganizationsApiActions.removeMemberFromOrganization,
    resetRequestState: ReduxActions.resetRequestState,
    searchMembersToAddToOrg: OrgsActions.searchMembersToAddToOrg,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgMembersSection);
