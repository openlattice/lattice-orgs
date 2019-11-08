/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Types } from 'lattice';
import { AuthUtils } from 'lattice-auth';
import { OrganizationsApiActions, PrincipalsApiActions } from 'lattice-sagas';
import {
  ActionModal,
  Card,
  CardSegment,
  Colors,
  MinusButton,
  PlusButton,
  Select,
  Spinner,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { PermissionType } from 'lattice';
import type { Match } from 'react-router';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import * as OrgsActions from './OrgsActions';
import * as PermissionsActions from '../../core/permissions/PermissionsActions';
import * as ReduxActions from '../../core/redux/ReduxActions';
import * as RoutingActions from '../../core/router/RoutingActions';
import { CompactCardSegment, SelectControlWithButton } from './components/styled';
import { Logger } from '../../utils';
import { getIdFromMatch } from '../../core/router/RouterUtils';
import { isNonEmptyString } from '../../utils/LangUtils';
import { getUserId, getUserProfileLabel } from '../../utils/PersonUtils';
import type { ResetRequestStateAction } from '../../core/redux/ReduxActions';
import type { GoToRoot } from '../../core/router/RoutingActions';

const { NEUTRALS, PURPLES } = Colors;
const { ActionTypes, PermissionTypes, PrincipalTypes } = Types;

const { GET_ORGANIZATION_PERMISSIONS } = OrgsActions;
const { GET_ALL_USERS } = PrincipalsApiActions;
const { UPDATE_USER_PERMISSION } = PermissionsActions;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 500;
  margin: 0;
`;

const PermissionsManagementSection = styled.section`
  border-left: 1px solid ${NEUTRALS[4]};
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  padding: 0 0 0 30px;

  > div {
    margin-bottom: 30px;
  }
`;

const SelectionSection = styled.section`
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  padding: 0 30px 0 0;
  width: 300px;

  > div {
    margin-bottom: 30px;

    &:last-child {
      margin-bottom: 0;
    }

    > h3 {
      margin: 16px 0;

      &:first-child {
        margin-top: 0;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }

    > h4 {
      color: ${NEUTRALS[2]};
      font-size: 16px;
      font-weight: normal;
      margin: 0;
    }
  }
`;

const SelectableHeader = styled.h3`
  color: ${({ isSelected }) => (isSelected ? PURPLES[1] : NEUTRALS[1])};
  cursor: pointer;
  font-size: 18px;
  font-weight: normal;
  margin: 0;

  &:hover {
    color: ${({ isSelected }) => (isSelected ? PURPLES[1] : NEUTRALS[0])};
  }
`;

const PermissionsHeader = styled.div`
  display: flex;
  justify-content: space-evenly;
`;

const Unauthorized = styled.div`
  border-left: 1px solid ${NEUTRALS[4]};
  padding: 0 0 0 30px;
`;

const UNAUTHORIZED = `
You are not authorized to view this role's permissions. Only the owner of a role can access other users'
permissions for that role.
`;

type Props = {
  actions :{
    getAllUsers :RequestSequence;
    getOrganizationPermissions :RequestSequence;
    goToRoot :GoToRoot;
    resetRequestState :ResetRequestStateAction;
    updateUserPermission :RequestSequence;
  };
  isOwner :boolean;
  match :Match;
  org :Map;
  orgAclKey :List;
  orgAcls :Map;
  requestStates :{
    GET_ALL_USERS :RequestState;
    GET_ORGANIZATION_PERMISSIONS :RequestState;
    UPDATE_USER_PERMISSION :RequestState;
  };
  users :Map;
};

type State = {
  isVisibleAddPermissionModal :boolean;
  isVisibleRemovePermissionModal :boolean;
  selectedAclKey :List;
  selectedPermission :PermissionType;
  selectedUserId :?string;
};

const LOG :Logger = new Logger('OrgPermissionsContainer');

class OrgPermissionsContainer extends Component<Props, State> {

  constructor(props :Props) {

    super(props);

    this.state = {
      isVisibleAddPermissionModal: false,
      isVisibleRemovePermissionModal: false,
      selectedAclKey: props.orgAclKey, // an empty "selectedAclKey" is treated as org + roles, i.e. everything
      selectedPermission: PermissionTypes.OWNER,
      selectedUserId: undefined,
    };
  }

  componentDidMount() {

    const { actions, match } = this.props;
    const orgId :?UUID = getIdFromMatch(match);

    actions.getAllUsers();
    actions.getOrganizationPermissions(orgId);
  }

  componentDidUpdate(props :Props) {

    const { actions, match, requestStates } = this.props;
    const orgId :?UUID = getIdFromMatch(match);
    const prevOrgId :?UUID = getIdFromMatch(props.match);

    if (orgId !== prevOrgId) {
      actions.getAllUsers();
      actions.getOrganizationPermissions(orgId);
    }
    else if (props.requestStates[UPDATE_USER_PERMISSION] === RequestStates.PENDING
        && requestStates[UPDATE_USER_PERMISSION] === RequestStates.SUCCESS) {
      actions.getOrganizationPermissions(orgId);
      this.closeModal();
    }
  }

  componentWillUnmount() {

    const { actions } = this.props;
    actions.resetRequestState(GET_ALL_USERS);
    actions.resetRequestState(GET_ORGANIZATION_PERMISSIONS);
    actions.resetRequestState(UPDATE_USER_PERMISSION);
  }

  handleOnChangeSelectedUser = (selectedOption :?{ label :string; value :string }) => {

    const selectedUserId = selectedOption && selectedOption.value
      ? selectedOption.value
      : undefined;

    this.setState({
      selectedUserId,
    });
  }

  handleOnClickAddPermission = () => {

    const { selectedUserId } = this.state;
    if (!isNonEmptyString(selectedUserId)) {
      return;
    }

    this.setState({
      isVisibleAddPermissionModal: true,
      isVisibleRemovePermissionModal: false,
    });
  }

  handleOnClickRemovePermission = (event :SyntheticEvent<HTMLElement>) => {

    const { currentTarget } = event;
    if (currentTarget instanceof HTMLElement) {
      const { dataset } = currentTarget;
      if (isNonEmptyString(dataset.userId)) {
        this.setState({
          isVisibleAddPermissionModal: false,
          isVisibleRemovePermissionModal: true,
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

  addPermissionToUser = () => {

    const { actions, isOwner, orgAcls } = this.props;
    const { selectedAclKey, selectedPermission, selectedUserId } = this.state;

    if (!isOwner) {
      LOG.error('only owners can update permissions');
      return;
    }

    // an empty "selectedAclKey" is treated as org + roles, i.e. everything
    const targetAclKeys :List<List<UUID>> = selectedAclKey.isEmpty()
      ? orgAcls.keySeq().toList()
      : List().push(selectedAclKey);

    actions.updateUserPermission({
      aclKeys: targetAclKeys,
      actionType: ActionTypes.ADD,
      permissionType: selectedPermission,
      userId: selectedUserId,
    });

    this.setState({
      selectedUserId: undefined,
    });
  }

  removePermissionFromUser = () => {

    const { actions, isOwner, orgAcls } = this.props;
    const { selectedAclKey, selectedPermission, selectedUserId } = this.state;

    if (!isOwner) {
      LOG.error('only owners can update permissions');
      return;
    }

    // an empty "selectedAclKey" is treated as org + roles, i.e. everything
    const targetAclKeys :List<List<UUID>> = selectedAclKey.isEmpty()
      ? orgAcls.keySeq().toList()
      : List().push(selectedAclKey);

    actions.updateUserPermission({
      aclKeys: targetAclKeys,
      actionType: ActionTypes.REMOVE,
      permissionType: selectedPermission,
      userId: selectedUserId,
    });
  }

  closeModal = () => {

    const { actions } = this.props;

    actions.resetRequestState(UPDATE_USER_PERMISSION);
    this.setState({
      isVisibleAddPermissionModal: false,
      isVisibleRemovePermissionModal: false,
    });
  }

  selectAclKey = (selectedAclKey :?List) => {

    // an empty "selectedAclKey" is treated as org + roles, i.e. everything
    this.setState({
      selectedAclKey: selectedAclKey || List(),
    });
  }

  selectPermission = (selectedPermission :PermissionType) => {

    this.setState({
      selectedPermission,
    });
  }

  getUserSelectOptions = () => {

    const { users } = this.props;

    if (!Map.isMap(users)) {
      return [];
    }

    return users.valueSeq().map((user :Map) => ({
      label: getUserProfileLabel(user),
      value: getUserId(user),
    }));
  }

  renderSelectionSection = () => {

    const { org, orgAclKey } = this.props;
    const { selectedAclKey } = this.state;

    const roles :List<Map> = org.get('roles', List());

    return (
      <SelectionSection>
        <div>
          <h4>Organization</h4>
          <SelectableHeader
              isSelected={selectedAclKey.equals(orgAclKey)}
              onClick={() => this.selectAclKey(orgAclKey)}>
            Organization
          </SelectableHeader>
          <SelectableHeader
              isSelected={selectedAclKey.isEmpty()}
              onClick={() => this.selectAclKey(List())}>
            Organization + Roles
          </SelectableHeader>
        </div>
        <div>
          <h4>Roles</h4>
          {
            roles.map((role :Map) => (
              <SelectableHeader
                  isSelected={selectedAclKey.equals(role.get('aclKey'))}
                  key={role.get('id')}
                  onClick={() => this.selectAclKey(role.get('aclKey'))}>
                {role.get('title')}
              </SelectableHeader>
            ))
          }
        </div>
      </SelectionSection>
    );
  }

  renderPermissionsManagementSection = () => {

    const {
      isOwner,
      orgAcls,
      requestStates,
      users,
    } = this.props;
    const { selectedAclKey, selectedPermission } = this.state;

    // an empty "selectedAclKey" is treated as org + roles, i.e. everything
    const targetAcls = selectedAclKey.isEmpty()
      ? orgAcls
      : Map().set(selectedAclKey, orgAcls.get(selectedAclKey, List()));

    const lookup = {}; // I don't like this
    const userCardSegments = [];
    targetAcls.forEach((acl :Map) => {
      acl.get('aces', List())
        .filter((ace :Map) => (
          ace.getIn(['principal', 'type']) === PrincipalTypes.USER
          && ace.get('permissions').includes(PermissionTypes[selectedPermission])
        ))
        .forEach((ace :Map) => {
          const userId :string = ace.getIn(['principal', 'id']);
          const user :Map = users.get(userId, Map());
          let userProfileLabel :string = getUserProfileLabel(user);
          const thisUserInfo :Object = AuthUtils.getUserInfo() || { id: '' };
          const thisUserId :string = thisUserInfo.id;
          if (userId === thisUserId) {
            userProfileLabel = `${userProfileLabel} (you)`;
          }
          if (!lookup[userId]) {
            lookup[userId] = true;
            userCardSegments.push((
              <CompactCardSegment key={userId || userProfileLabel}>
                <span title={userProfileLabel}>{userProfileLabel}</span>
                <MinusButton
                    disabled={!isOwner}
                    data-user-id={userId}
                    mode="negative"
                    onClick={this.handleOnClickRemovePermission} />
              </CompactCardSegment>
            ));
          }
        });
    });

    const isPending = requestStates[GET_ALL_USERS] === RequestStates.PENDING
      || requestStates[GET_ORGANIZATION_PERMISSIONS] === RequestStates.PENDING;
      || requestStates[UPDATE_USER_PERMISSION] === RequestStates.PENDING;

    return (
      <PermissionsManagementSection>
        <PermissionsHeader>
          <SelectableHeader
              isSelected={selectedPermission === PermissionTypes.OWNER}
              onClick={() => this.selectPermission(PermissionTypes.OWNER)}>
            Owner
          </SelectableHeader>
          <SelectableHeader
              isSelected={selectedPermission === PermissionTypes.WRITE}
              onClick={() => this.selectPermission(PermissionTypes.WRITE)}>
            Write
          </SelectableHeader>
          <SelectableHeader
              isSelected={selectedPermission === PermissionTypes.READ}
              onClick={() => this.selectPermission(PermissionTypes.READ)}>
            Read
          </SelectableHeader>
          <SelectableHeader
              isSelected={selectedPermission === PermissionTypes.LINK}
              onClick={() => this.selectPermission(PermissionTypes.LINK)}>
            Link
          </SelectableHeader>
          <SelectableHeader
              isSelected={selectedPermission === PermissionTypes.DISCOVER}
              onClick={() => this.selectPermission(PermissionTypes.DISCOVER)}>
            Discover
          </SelectableHeader>
        </PermissionsHeader>
        {
          isPending && (
            <Spinner size="2x" />
          )
        }
        {
          !isPending && (
            <SelectControlWithButton>
              <Select
                  isClearable
                  options={this.getUserSelectOptions()}
                  onChange={this.handleOnChangeSelectedUser}
                  placeholder="Select a user" />
              <PlusButton
                  mode="positive"
                  onClick={this.handleOnClickAddPermission} />
            </SelectControlWithButton>
          )
        }
        {
          !isPending && userCardSegments.length > 0 && (
            <Card>{userCardSegments}</Card>
          )
        }
      </PermissionsManagementSection>
    );
  }

  renderUnauthorizedAccess = () => (
    <Unauthorized>
      <span>{UNAUTHORIZED}</span>
    </Unauthorized>
  )

  renderAddPermissionModal = () => {

    const { requestStates } = this.props;
    const { isVisibleAddPermissionModal } = this.state;

    return (
      <ActionModal
          isVisible={isVisibleAddPermissionModal}
          onClickPrimary={this.addPermissionToUser}
          onClose={this.closeModal}
          requestState={requestStates[UPDATE_USER_PERMISSION]}
          textTitle="Add Permission To User" />
    );
  }

  renderRemovePermissionModal = () => {

    const { requestStates } = this.props;
    const { isVisibleRemovePermissionModal } = this.state;

    return (
      <ActionModal
          isVisible={isVisibleRemovePermissionModal}
          onClickPrimary={this.removePermissionFromUser}
          onClose={this.closeModal}
          requestState={requestStates[UPDATE_USER_PERMISSION]}
          textTitle="Remove Permission From User" />
    );
  }

  render() {

    const { isOwner, orgAcls } = this.props;
    const { selectedAclKey } = this.state;
    if (!isOwner) {
      return null;
    }

    let isAuthorized :boolean = true;
    const selectedAcl :Map = orgAcls.get(selectedAclKey, Map());
    if (selectedAcl.getIn(['error', 'status']) === 401
        && selectedAcl.getIn(['error', 'statusText']) === 'Unauthorized') {
      isAuthorized = false;
    }

    return (
      <Card>
        <CardSegment noBleed>
          <Title>Organization and Role Permissions</Title>
        </CardSegment>
        <CardSegment>
          {this.renderSelectionSection()}
          {isAuthorized && this.renderPermissionsManagementSection()}
          {!isAuthorized && this.renderUnauthorizedAccess()}
        </CardSegment>
        {this.renderAddPermissionModal()}
        {this.renderRemovePermissionModal()}
      </Card>
    );
  }
}

const mapStateToProps = (state :Map, props :Object) => {

  const orgId :?UUID = getIdFromMatch(props.match);

  return {
    isOwner: state.hasIn(['orgs', 'isOwnerOfOrgIds', orgId], false),
    org: state.getIn(['orgs', 'orgs', orgId], Map()),
    orgAclKey: List([orgId]),
    orgAcls: state.getIn(['orgs', 'orgAcls', orgId], Map()),
    requestStates: {
      [GET_ALL_USERS]: state.getIn(['users', GET_ALL_USERS, 'requestState']),
      [GET_ORGANIZATION_PERMISSIONS]: state.getIn(['orgs', GET_ORGANIZATION_PERMISSIONS, 'requestState']),
      [UPDATE_USER_PERMISSION]: state.getIn(['permissions', UPDATE_USER_PERMISSION, 'requestState']),
    },
    users: state.getIn(['users', 'users'], Map()),
  };
};

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    deleteOrganization: OrganizationsApiActions.deleteOrganization,
    getAllUsers: PrincipalsApiActions.getAllUsers,
    getOrganizationDetails: OrgsActions.getOrganizationDetails,
    getOrganizationPermissions: OrgsActions.getOrganizationPermissions,
    goToRoot: RoutingActions.goToRoot,
    resetRequestState: ReduxActions.resetRequestState,
    updateUserPermission: PermissionsActions.updateUserPermission,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgPermissionsContainer);
