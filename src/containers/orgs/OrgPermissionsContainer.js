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

const { GET_ORGANIZATION_ACLS } = OrgsActions;
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
    getOrganizationACLs :RequestSequence;
    goToRoot :GoToRoot;
    resetRequestState :ResetRequestStateAction;
    updateUserPermission :RequestSequence;
  };
  isOwner :boolean;
  match :Match;
  org :Map;
  orgAclKey :List;
  orgACLs :Map;
  requestStates :{
    GET_ALL_USERS :RequestState;
    GET_ORGANIZATION_ACLS :RequestState;
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
    actions.getOrganizationACLs(orgId);
  }

  componentDidUpdate(props :Props) {

    const { actions, match, requestStates } = this.props;
    const orgId :?UUID = getIdFromMatch(match);
    const prevOrgId :?UUID = getIdFromMatch(props.match);

    if (orgId !== prevOrgId) {
      actions.getAllUsers();
      actions.getOrganizationACLs(orgId);
    }
    else if (props.requestStates[UPDATE_USER_PERMISSION] === RequestStates.PENDING
        && requestStates[UPDATE_USER_PERMISSION] === RequestStates.SUCCESS) {
      actions.getOrganizationACLs(orgId);
    }
  }

  componentWillUnmount() {

    const { actions } = this.props;
    actions.resetRequestState(GET_ALL_USERS);
    actions.resetRequestState(GET_ORGANIZATION_ACLS);
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

    const { actions, isOwner, orgACLs } = this.props;
    const { selectedAclKey, selectedPermission, selectedUserId } = this.state;

    if (!isOwner) {
      LOG.error('only owners can update permissions');
      return;
    }

    // an empty "selectedAclKey" is treated as org + roles, i.e. everything
    const targetAclKeys :List<List<UUID>> = selectedAclKey.isEmpty()
      ? orgACLs.keySeq().toList()
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

    const { actions, isOwner, orgACLs } = this.props;
    const { selectedAclKey, selectedPermission, selectedUserId } = this.state;

    if (!isOwner) {
      LOG.error('only owners can update permissions');
      return;
    }

    // an empty "selectedAclKey" is treated as org + roles, i.e. everything
    const targetAclKeys :List<List<UUID>> = selectedAclKey.isEmpty()
      ? orgACLs.keySeq().toList()
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

    const { selectedAclKey: stateSelectedAclKey } = this.state;

    if (stateSelectedAclKey.equals(selectedAclKey)) {
      return;
    }

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
            roles.map((role :Map) => {
              const roleAclKey :List<List<UUID>> = List([org.get('id'), role.get('id')]);
              return (
                <SelectableHeader
                    isSelected={selectedAclKey.equals(roleAclKey)}
                    key={role.get('id')}
                    onClick={() => this.selectAclKey(roleAclKey)}>
                  {role.get('title')}
                </SelectableHeader>
              );
            })
          }
        </div>
      </SelectionSection>
    );
  }

  renderPermissionsManagementSection = () => {

    const { requestStates } = this.props;
    const { selectedPermission } = this.state;

    const isPending = requestStates[GET_ALL_USERS] === RequestStates.PENDING
      || requestStates[GET_ORGANIZATION_ACLS] === RequestStates.PENDING;

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
          isPending
            ? (
              <Spinner size="2x" />
            )
            : this.renderUserPermissions()
        }
      </PermissionsManagementSection>
    );
  }

  renderUserPermissions = () => {

    const { orgACLs } = this.props;
    const { selectedAclKey, selectedPermission } = this.state;

    const userCardSegments = [];

    // an empty "selectedAclKey" is treated as org + roles, i.e. everything
    if (selectedAclKey.isEmpty()) {

      const aclKeysMap :Map<string, List<List<UUID>>> = Map().withMutations((map :Map) => {
        orgACLs.forEach((acl :Map) => {
          const aclKey :List<UUID> = acl.get('aclKey');
          acl.get('aces', List()).forEach((ace :Map) => {
            if (
              ace.getIn(['principal', 'type']) === PrincipalTypes.USER
              && ace.get('permissions').includes(selectedPermission)
            ) {
              const userId :string = getUserId(ace);
              map.update(userId, List(), (aclKeys :List<List<UUID>>) => aclKeys.push(aclKey));
            }
          });
        });
      });

      const orgACLKeys :List<List<UUID>> = orgACLs.keySeq().toList();
      aclKeysMap
        .filter((aclKeys :List<List<UUID>>) => aclKeys.equals(orgACLKeys))
        .keySeq()
        .forEach((userId :string) => {
          userCardSegments.push(this.renderUserCardSegment(userId));
        });
    }
    else {
      orgACLs.get(selectedAclKey, Map()).get('aces', List())
        .filter((ace :Map) => (
          ace.getIn(['principal', 'type']) === PrincipalTypes.USER
          && ace.get('permissions').includes(selectedPermission)
        ))
        .forEach((ace :Map) => {
          const userId :string = getUserId(ace);
          userCardSegments.push(this.renderUserCardSegment(userId));
        });
    }

    return (
      <>
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
        {
          userCardSegments.length > 0 && (
            <Card>{userCardSegments}</Card>
          )
        }
      </>
    );
  }

  renderUserCardSegment = (userId :string) => {

    const { isOwner, users } = this.props;

    const user :Map = users.get(userId, Map());
    const userProfileLabel :string = getUserProfileLabel(user);

    return (
      <CompactCardSegment key={userId}>
        <span title={userProfileLabel}>{userProfileLabel}</span>
        <MinusButton
            disabled={!isOwner}
            data-user-id={userId}
            mode="negative"
            onClick={this.handleOnClickRemovePermission} />
      </CompactCardSegment>
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

    const { isOwner, orgACLs } = this.props;
    const { selectedAclKey } = this.state;
    if (!isOwner) {
      return null;
    }

    let isAuthorized :boolean = true;
    const selectedAcl :Map = orgACLs.get(selectedAclKey, Map());
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
    orgACLs: state.getIn(['orgs', 'orgACLs', orgId], Map()),
    requestStates: {
      [GET_ALL_USERS]: state.getIn(['users', GET_ALL_USERS, 'requestState']),
      [GET_ORGANIZATION_ACLS]: state.getIn(['orgs', GET_ORGANIZATION_ACLS, 'requestState']),
      [UPDATE_USER_PERMISSION]: state.getIn(['permissions', UPDATE_USER_PERMISSION, 'requestState']),
    },
    users: state.getIn(['users', 'users'], Map()),
  };
};

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    deleteOrganization: OrganizationsApiActions.deleteOrganization,
    getAllUsers: PrincipalsApiActions.getAllUsers,
    getOrganizationACLs: OrgsActions.getOrganizationACLs,
    getOrganizationDetails: OrgsActions.getOrganizationDetails,
    goToRoot: RoutingActions.goToRoot,
    resetRequestState: ReduxActions.resetRequestState,
    updateUserPermission: PermissionsActions.updateUserPermission,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgPermissionsContainer);
