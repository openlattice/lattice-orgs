/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Types } from 'lattice';
import { PrincipalsApiActions } from 'lattice-sagas';
import {
  Card,
  CardSegment,
  Checkbox,
  Colors,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
// import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import * as OrgsActions from './OrgsActions';
import * as ReduxActions from '../../core/redux/ReduxActions';
import * as RoutingActions from '../../core/router/RoutingActions';
import { getIdFromMatch } from '../../core/router/RouterUtils';
import { isDefined } from '../../utils/LangUtils';
import { getUserId, getUserProfileLabel } from '../../utils/PersonUtils';
import type { GoToRoot } from '../../core/router/RoutingActions';

const { NEUTRALS, PURPLES } = Colors;
const { PrincipalTypes } = Types;

const { GET_ORGANIZATION_PERMISSIONS } = OrgsActions;
const { GET_ALL_USERS } = PrincipalsApiActions;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 500;
  margin: 0;
`;

const RoleAssignmentsGrid = styled.div`
  display: grid;
  grid-gap: 30px;
  grid-template-columns: auto 1fr;
`;

const ItemText = styled.span`
  color: ${({ isSelected }) => (isSelected ? PURPLES[1] : NEUTRALS[1])};
  cursor: pointer;
  flex: 1 1 auto;
  overflow: hidden;
  padding: 10px 0;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    color: ${({ isSelected }) => (isSelected ? PURPLES[1] : NEUTRALS[0])};
  }
`;

const SectionGrid = styled.section`
  align-items: flex-start;
  display: grid;
  grid-auto-rows: min-content;
  position: relative;

  &:first-child {
    border-right: 1px solid ${NEUTRALS[4]};
    max-width: 400px;
    min-width: 300px;
    padding-right: 30px;
  }

  > div {
    border-bottom: 1px solid ${NEUTRALS[4]};
    border-top: 1px solid ${NEUTRALS[4]};
    margin-bottom: -1px;

    &:first-child {
      border-top: none;

      span {
        padding: 0 0 10px 0;
      }
    }

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;

      span {
        padding: 10px 0 0 0;
      }
    }
  }
`;

const SectionItem = styled.div`
  align-items: center;
  display: flex;
  flex: 1 0 auto;
  justify-content: space-between;
  min-width: 0;

  > label {
    cursor: pointer;
    margin: 0 0 0 10px;
    padding: 0 10px; /* fixes alignment issue when there's text overflow */
    visibility: ${({ isCheckBoxVisible }) => (isCheckBoxVisible ? 'visible' : 'hidden')};
  }
`;

type Props = {
  actions :{
    goToRoot :GoToRoot;
    resetRequestState :(actionType :string) => void;
  };
  isOwner :boolean;
  org :Map;
  orgMembers :Map;
  requestStates :{
    GET_ALL_USERS :RequestState;
    GET_ORGANIZATION_PERMISSIONS :RequestState;
  };
};

type State = {
  selectedRoleId :?UUID;
  selectedUserId :?string;
};

class OrgRolesContainer extends Component<Props, State> {

  rolesRef :{ current :null | HTMLElement } = React.createRef();
  usersRef :{ current :null | HTMLElement } = React.createRef();

  constructor(props :Props) {
    super(props);
    this.state = {
      selectedRoleId: undefined,
      selectedUserId: undefined,
    };
  }

  componentDidMount() {

    document.addEventListener('mousedown', this.handleOnClickOutside, false);
  }

  componentWillUnmount() {

    document.removeEventListener('mousedown', this.handleOnClickOutside, false);
  }

  handleOnClickOutside = (event :SyntheticEvent<HTMLElement>) => {

    if (this.rolesRef.current && !this.rolesRef.current.contains(event.target)
        && this.usersRef.current && !this.usersRef.current.contains(event.target)) {
      this.setState({
        selectedRoleId: undefined,
        selectedUserId: undefined,
      });
    }
  }

  selectUser = (userId :string) => {

    this.setState({
      selectedRoleId: undefined,
      selectedUserId: userId,
    });
  }

  selectRole = (roleId :UUID) => {

    this.setState({
      selectedRoleId: roleId,
      selectedUserId: undefined,
    });
  }

  isRoleAssignedToMember = (roleId :?UUID, member :?Map) => {

    if (Map.isMap(member)) {
      const roleIndex :number = member.get('roles', List())
        .findIndex((role :Map) => (
          role.get('id') === roleId
          && role.getIn(['principal', 'type']) === PrincipalTypes.ROLE
        ));
      return roleIndex !== -1;
    }

    return false;
  }

  renderRolesSection = () => {

    const { org, orgMembers } = this.props;
    const { selectedRoleId, selectedUserId } = this.state;

    let selectedMember :Map;
    if (isDefined(selectedUserId)) {
      selectedMember = orgMembers.find((member :Map) => (
        member.getIn(['principal', 'principal', 'id']) === selectedUserId
        && member.getIn(['principal', 'principal', 'type']) === PrincipalTypes.USER
      ));
    }

    const roles = org.get('roles', List());
    const roleElements = roles.map((role :Map) => {
      const roleId :UUID = role.get('id');
      const title :string = role.get('title');
      const isRoleAssignedToMember = this.isRoleAssignedToMember(roleId, selectedMember);
      return (
        <SectionItem isCheckBoxVisible={isDefined(selectedUserId)} key={roleId}>
          <ItemText
              isSelected={selectedRoleId === roleId}
              onClick={() => this.selectRole(roleId)}
              title={title}>
            {title}
          </ItemText>
          <Checkbox checked={isRoleAssignedToMember} />
        </SectionItem>
      );
    });

    return (
      <SectionGrid ref={this.rolesRef}>
        {roleElements}
      </SectionGrid>
    );
  }

  renderMembersSection = () => {

    const { orgMembers } = this.props;
    const { selectedRoleId, selectedUserId } = this.state;

    const memberElements = orgMembers.map((member :Map) => {
      const userProfileLabel :string = getUserProfileLabel(member);
      const userId :string = getUserId(member);
      const isRoleAssignedToMember = this.isRoleAssignedToMember(selectedRoleId, member);
      return (
        <SectionItem isCheckBoxVisible={isDefined(selectedRoleId)} key={userId}>
          <ItemText
              isSelected={selectedUserId === userId}
              onClick={() => this.selectUser(userId)}
              title={userProfileLabel}>
            {userProfileLabel}
          </ItemText>
          <Checkbox checked={isRoleAssignedToMember} />
        </SectionItem>
      );
    });

    return (
      <SectionGrid ref={this.usersRef}>
        {memberElements}
      </SectionGrid>
    );
  }

  render() {

    const { isOwner } = this.props;
    if (!isOwner) {
      return null;
    }

    return (
      <Card>
        <CardSegment noBleed>
          <Title>Role Assignments</Title>
        </CardSegment>
        <CardSegment vertical>
          <RoleAssignmentsGrid>
            {this.renderRolesSection()}
            {this.renderMembersSection()}
          </RoleAssignmentsGrid>
        </CardSegment>
      </Card>
    );
  }
}

const mapStateToProps = (state :Map, props :Object) => {

  const orgId :?UUID = getIdFromMatch(props.match);

  return {
    isOwner: state.hasIn(['orgs', 'isOwnerOfOrgIds', orgId], false),
    org: state.getIn(['orgs', 'orgs', orgId], Map()),
    orgMembers: state.getIn(['orgs', 'orgMembers', orgId], Map()),
    requestStates: {
      [GET_ALL_USERS]: state.getIn(['principals', GET_ALL_USERS, 'requestState']),
      [GET_ORGANIZATION_PERMISSIONS]: state.getIn(['orgs', GET_ORGANIZATION_PERMISSIONS, 'requestState']),
    },
    users: state.getIn(['principals', 'users'], Map()),
  };
};

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    goToRoot: RoutingActions.goToRoot,
    resetRequestState: ReduxActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgRolesContainer);
