/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Types } from 'lattice';
import { OrganizationsApiActions, PrincipalsApiActions } from 'lattice-sagas';
import {
  ActionModal,
  Card,
  CardSegment,
  Checkbox,
  Colors,
  Spinner,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import * as OrgsActions from './OrgsActions';
import * as ReduxActions from '../../core/redux/ReduxActions';
import * as RoutingActions from '../../core/router/RoutingActions';
import { OrgRolesSection } from './components';
import { SectionGrid } from '../../components';
import { Logger } from '../../utils';
import { getIdFromMatch } from '../../core/router/RouterUtils';
import { isDefined } from '../../utils/LangUtils';
import { getUserId, getUserProfileLabel } from '../../utils/PersonUtils';
import type { GoToRoot } from '../../core/router/RoutingActions';

const { NEUTRALS, PURPLES } = Colors;
const { PrincipalTypes } = Types;

const { GET_ORGANIZATION_PERMISSIONS } = OrgsActions;
const { ADD_ROLE_TO_MEMBER, REMOVE_ROLE_FROM_MEMBER } = OrganizationsApiActions;
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

  > section:first-child {
    border-right: 1px solid ${NEUTRALS[4]};
    max-width: 400px;
    min-width: 300px;
    padding-right: 30px;
  }
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

const RoleAssignmentsSection = styled.section`
  align-items: flex-start;
  display: grid;
  grid-auto-rows: min-content;
  position: relative;

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

const LOG :Logger = new Logger('OrgRolesContainer');

type Props = {
  actions :{
    addRoleToMember :RequestSequence;
    goToRoot :GoToRoot;
    removeRoleFromMember :RequestSequence;
    resetRequestState :(actionType :string) => void;
  };
  isOwner :boolean;
  org :Map;
  orgMembers :Map;
  requestStates :{
    ADD_ROLE_TO_MEMBER :RequestState;
    GET_ALL_USERS :RequestState;
    GET_ORGANIZATION_PERMISSIONS :RequestState;
    REMOVE_ROLE_FROM_MEMBER :RequestState;
  };
};

type State = {
  actionMemberId :?string;
  actionRoleId :?UUID;
  isVisibleActionModal :boolean;
  selectedRoleId :?UUID;
  selectedUserId :?string;
};

class OrgRolesContainer extends Component<Props, State> {

  rolesRef :{ current :null | HTMLElement } = React.createRef();
  usersRef :{ current :null | HTMLElement } = React.createRef();

  constructor(props :Props) {
    super(props);
    this.state = {
      actionMemberId: undefined,
      actionRoleId: undefined,
      isVisibleActionModal: false,
      selectedRoleId: undefined,
      selectedUserId: undefined,
    };
  }

  componentDidUpdate(props :Props) {

    const { actions, requestStates } = this.props;

    const success1 = props.requestStates[ADD_ROLE_TO_MEMBER] === RequestStates.PENDING
        && requestStates[ADD_ROLE_TO_MEMBER] === RequestStates.SUCCESS;

    const success2 = props.requestStates[REMOVE_ROLE_FROM_MEMBER] === RequestStates.PENDING
        && requestStates[REMOVE_ROLE_FROM_MEMBER] === RequestStates.SUCCESS;

    if (success1 || success2) {
      actions.resetRequestState(ADD_ROLE_TO_MEMBER);
      actions.resetRequestState(REMOVE_ROLE_FROM_MEMBER);
      this.setState({
        actionMemberId: undefined,
        actionRoleId: undefined,
        isVisibleActionModal: false,
      });
    }
  }

  componentDidMount() {

    document.addEventListener('mousedown', this.handleOnClickOutside, false);
  }

  componentWillUnmount() {

    document.removeEventListener('mousedown', this.handleOnClickOutside, false);
  }

  handleOnChangeCheckBox = (event :SyntheticEvent<HTMLElement>) => {

    const { selectedRoleId, selectedUserId } = this.state;

    const { target } = event;
    if (target instanceof HTMLElement) {

      let memberId :?string;
      let roleId :?UUID;

      const { dataset } = target;
      if (isDefined(dataset.roleId) && isDefined(selectedUserId)) {
        roleId = dataset.roleId;
        memberId = selectedUserId;
      }
      else if (isDefined(dataset.userId) && isDefined(selectedRoleId)) {
        roleId = selectedRoleId;
        memberId = dataset.userId;
      }

      this.setState({
        actionMemberId: memberId,
        actionRoleId: roleId,
        isVisibleActionModal: true,
      });
    }
  }

  handleOnClickOutside = (event :MouseEvent) => {

    const { target } = event;

    if (target instanceof Node
        && this.rolesRef.current && !this.rolesRef.current.contains(target)
        && this.usersRef.current && !this.usersRef.current.contains(target)) {
      this.setState({
        selectedRoleId: undefined,
        selectedUserId: undefined,
      });
    }
  }

  hideModal = () => {

    this.setState({
      isVisibleActionModal: false,
    });
  }

  selectRole = (roleId :UUID) => {

    this.setState({
      selectedRoleId: roleId,
      selectedUserId: undefined,
    });
  }

  selectUser = (userId :string) => {

    this.setState({
      selectedRoleId: undefined,
      selectedUserId: userId,
    });
  }

  updateRoleAssignment = () => {

    const { actions, isOwner, org } = this.props;
    const { actionMemberId: memberId, actionRoleId: roleId } = this.state;

    if (isOwner) {
      const organizationId :UUID = org.get('id');
      const isRoleAssignedToMember = this.isRoleAssignedToMember(roleId, memberId);
      if (isRoleAssignedToMember) {
        actions.removeRoleFromMember({ memberId, organizationId, roleId });
      }
      else {
        actions.addRoleToMember({ memberId, organizationId, roleId });
      }
    }
    else {
      LOG.warn('cannot update role assignment because the user is not an owner of the org');
    }
  }

  isRoleAssignedToMember = (roleId :?UUID, userIdOrMember :UUID | Map) => {

    const { orgMembers } = this.props;

    let targetMember :?Map = userIdOrMember;
    if (isDefined(userIdOrMember) && !Map.isMap(userIdOrMember)) {
      // userIdOrMember === userId
      const userId :UUID = userIdOrMember;
      targetMember = orgMembers.find((member :Map) => (
        member.getIn(['principal', 'principal', 'id']) === userId
        && member.getIn(['principal', 'principal', 'type']) === PrincipalTypes.USER
      ));
    }

    if (Map.isMap(targetMember) && targetMember) {
      const roleIndex :number = targetMember.get('roles', List())
        .findIndex((role :Map) => (
          role.get('id') === roleId
          && role.getIn(['principal', 'type']) === PrincipalTypes.ROLE
        ));
      return roleIndex !== -1;
    }

    return false;
  }

  renderRolesSection = () => {

    const { org } = this.props;
    const { selectedRoleId, selectedUserId } = this.state;

    const roles = org.get('roles', List());
    const roleElements = roles.map((role :Map) => {
      const roleId :UUID = role.get('id');
      const title :string = role.get('title');
      const isRoleAssignedToMember = this.isRoleAssignedToMember(roleId, selectedUserId);
      return (
        <SectionItem isCheckBoxVisible={isDefined(selectedUserId)} key={roleId}>
          <ItemText
              isSelected={selectedRoleId === roleId}
              onClick={() => this.selectRole(roleId)}
              title={title}>
            {title}
          </ItemText>
          <Checkbox
              checked={isRoleAssignedToMember}
              data-role-id={roleId}
              onChange={this.handleOnChangeCheckBox} />
        </SectionItem>
      );
    });

    return (
      <RoleAssignmentsSection ref={this.rolesRef}>
        {roleElements}
      </RoleAssignmentsSection>
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
          <Checkbox
              checked={isRoleAssignedToMember}
              data-user-id={userId}
              onChange={this.handleOnChangeCheckBox} />
        </SectionItem>
      );
    });

    return (
      <RoleAssignmentsSection ref={this.usersRef}>
        {memberElements}
      </RoleAssignmentsSection>
    );
  }

  renderActionModal = () => {

    const { requestStates } = this.props;
    const { isVisibleActionModal } = this.state;

    let modalRequestState :RequestState = RequestStates.STANDBY;
    if (requestStates[ADD_ROLE_TO_MEMBER] === RequestStates.PENDING
        || requestStates[REMOVE_ROLE_FROM_MEMBER] === RequestStates.PENDING) {
      modalRequestState = RequestStates.PENDING;
    }
    else if (requestStates[ADD_ROLE_TO_MEMBER] === RequestStates.SUCCESS
        || requestStates[REMOVE_ROLE_FROM_MEMBER] === RequestStates.SUCCESS) {
      modalRequestState = RequestStates.SUCCESS;
    }
    else if (requestStates[ADD_ROLE_TO_MEMBER] === RequestStates.FAILURE
        || requestStates[REMOVE_ROLE_FROM_MEMBER] === RequestStates.FAILURE) {
      modalRequestState = RequestStates.FAILURE;
    }

    return (
      <ActionModal
          isVisible={isVisibleActionModal}
          onClickPrimary={this.updateRoleAssignment}
          onClickSecondary={this.hideModal}
          onClose={this.hideModal}
          requestState={modalRequestState}
          shouldStretchButtons
          textTitle="Update Role Assignment" />
    );
  }

  render() {

    const { isOwner, org } = this.props;

    if (!isOwner) {
      return null;
    }

    return (
      <>
        <Card>
          <CardSegment noBleed>
            <OrgRolesSection isOwner={isOwner} org={org} />
          </CardSegment>
          <CardSegment vertical>
            <SectionGrid>
              <h2>Role Assignments</h2>
              <RoleAssignmentsGrid>
                {this.renderRolesSection()}
                {this.renderMembersSection()}
              </RoleAssignmentsGrid>
            </SectionGrid>
          </CardSegment>
        </Card>
        {this.renderActionModal()}
      </>
    );
  }
}

const mapStateToProps = (state :Map, props :Object) => {

  const orgId :?UUID = getIdFromMatch(props.match);

  return {
    isOwner: state.hasIn(['orgs', 'isOwnerOfOrgIds', orgId], false),
    org: state.getIn(['orgs', 'orgs', orgId], Map()),
    orgMembers: state.getIn(['orgs', 'orgMembers', orgId], List()),
    requestStates: {
      [ADD_ROLE_TO_MEMBER]: state.getIn(['orgs', ADD_ROLE_TO_MEMBER, 'requestState']),
      [GET_ALL_USERS]: state.getIn(['principals', GET_ALL_USERS, 'requestState']),
      [GET_ORGANIZATION_PERMISSIONS]: state.getIn(['orgs', GET_ORGANIZATION_PERMISSIONS, 'requestState']),
      [REMOVE_ROLE_FROM_MEMBER]: state.getIn(['orgs', REMOVE_ROLE_FROM_MEMBER, 'requestState']),
    },
    users: state.getIn(['principals', 'users'], Map()),
  };
};

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    addRoleToMember: OrganizationsApiActions.addRoleToMember,
    goToRoot: RoutingActions.goToRoot,
    removeRoleFromMember: OrganizationsApiActions.removeRoleFromMember,
    resetRequestState: ReduxActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgRolesContainer);
