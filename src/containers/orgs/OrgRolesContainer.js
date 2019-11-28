/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Types } from 'lattice';
import { OrganizationsApiActions } from 'lattice-sagas';
import {
  ActionModal,
  Card,
  CardSegment,
  Checkbox,
  Colors,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { Match } from 'react-router';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import * as OrgsActions from './OrgsActions';
import * as ReduxActions from '../../core/redux/ReduxActions';
import * as RoutingActions from '../../core/router/RoutingActions';
import { OrgRoleGrantsSection, OrgRolesSection } from './components';
import { SectionGrid } from '../../components';
import { Logger } from '../../utils';
import { getIdFromMatch } from '../../core/router/RouterUtils';
import { isDefined } from '../../utils/LangUtils';
import { getUserId, getUserProfileLabel } from '../../utils/PersonUtils';
import type { GoToRoot } from '../../core/router/RoutingActions';

const { NEUTRALS, PURPLES } = Colors;
const { PrincipalTypes } = Types;

const { GET_ORGANIZATION_ACLS } = OrgsActions;
const { ADD_ROLE_TO_MEMBER, REMOVE_ROLE_FROM_MEMBER } = OrganizationsApiActions;

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

      > span {
        padding: 0 0 10px 0;
      }
    }

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;

      > span {
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
    addRoleToMember :RequestSequence;
    goToRoot :GoToRoot;
    removeRoleFromMember :RequestSequence;
    resetRequestState :(actionType :string) => void;
  };
  isOwner :boolean;
  match :Match;
  org :Map;
  orgMembers :Map;
  requestStates :{
    ADD_ROLE_TO_MEMBER :RequestState;
    GET_ALL_USERS :RequestState;
    GET_ORGANIZATION_ACLS :RequestState;
    REMOVE_ROLE_FROM_MEMBER :RequestState;
  };
};

type State = {
  actionMemberId :?string;
  actionRoleId :?UUID;
  isVisibleAddRoleModal :boolean;
  isVisibleRemoveRoleModal :boolean;
  selectedRoleId :?UUID;
  selectedUserId :?string;
};

const LOG :Logger = new Logger('OrgRolesContainer');

class OrgRolesContainer extends Component<Props, State> {

  addRoleModalRef :{ current :null | HTMLElement } = React.createRef();
  removeRoleModalRef :{ current :null | HTMLElement } = React.createRef();
  rolesRef :{ current :null | HTMLElement } = React.createRef();
  usersRef :{ current :null | HTMLElement } = React.createRef();

  constructor(props :Props) {
    super(props);
    this.state = {
      actionMemberId: undefined,
      actionRoleId: undefined,
      isVisibleAddRoleModal: false,
      isVisibleRemoveRoleModal: false,
      selectedRoleId: undefined,
      selectedUserId: undefined,
    };
  }

  componentDidMount() {

    document.addEventListener('click', this.handleOnClickOutside, false);
  }

  componentWillUnmount() {

    document.removeEventListener('click', this.handleOnClickOutside, false);
  }

  handleOnChangeCheckBox = (event :SyntheticEvent<HTMLElement>) => {

    const { selectedRoleId, selectedUserId } = this.state;

    const { currentTarget } = event;
    if (currentTarget instanceof HTMLElement) {

      let memberId :?string;
      let roleId :?UUID;

      const { dataset } = currentTarget;
      if (isDefined(dataset.roleId) && isDefined(selectedUserId)) {
        roleId = dataset.roleId;
        memberId = selectedUserId;
      }
      else if (isDefined(dataset.userId) && isDefined(selectedRoleId)) {
        roleId = selectedRoleId;
        memberId = dataset.userId;
      }

      const isRoleAssignedToMember = this.isRoleAssignedToMember(roleId, memberId);
      const isVisibleAddRoleModal = !isRoleAssignedToMember;
      const isVisibleRemoveRoleModal = isRoleAssignedToMember;

      this.setState({
        isVisibleAddRoleModal,
        isVisibleRemoveRoleModal,
        actionMemberId: memberId,
        actionRoleId: roleId,
      });
    }
    else {
      LOG.warn('target is not an HTMLElement', currentTarget);
    }
  }

  handleOnClickOutside = (event :MouseEvent) => {

    const { target } = event;

    /*
     * if you click to close the modal, either by a button click or an outside click, the modal and its ref are
     * no longer available, which means the modal ref checks below will fail, which we don't want.
     *   ... HOWEVER ...
     * "target" is still defined which means "document.contains(target)" will return false, which means we know that
     * this click is a modal click so its safe to ignore this click.
     */
    if (target instanceof Node && document.contains(target)) {

      // we dont want to unselect if any of the modals are open
      if (
        (this.addRoleModalRef.current && this.addRoleModalRef.current.contains(target))
        || (this.removeRoleModalRef.current && this.removeRoleModalRef.current.contains(target))
      ) {
        return;
      }

      // we want to unselect only if the click is outside of these nodes
      if (
        this.rolesRef.current && !this.rolesRef.current.contains(target)
        && this.usersRef.current && !this.usersRef.current.contains(target)
      ) {
        this.setState({
          selectedRoleId: undefined,
          selectedUserId: undefined,
        });
      }
    }
  }

  closeModal = () => {

    const { actions } = this.props;

    actions.resetRequestState(ADD_ROLE_TO_MEMBER);
    actions.resetRequestState(REMOVE_ROLE_FROM_MEMBER);

    this.setState({
      actionMemberId: undefined,
      actionRoleId: undefined,
      isVisibleAddRoleModal: false,
      isVisibleRemoveRoleModal: false,
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

    const { isOwner, org } = this.props;
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
              disabled={!isOwner}
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

    const { isOwner, orgMembers } = this.props;
    const { selectedRoleId, selectedUserId } = this.state;

    const memberElements = orgMembers.map((member :Map) => {
      const userId :string = getUserId(member);
      const userProfileLabel :string = getUserProfileLabel(member) || userId;
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
              disabled={!isOwner}
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

  renderAddRoleModal = () => {

    const { requestStates } = this.props;
    const { isVisibleAddRoleModal } = this.state;

    return (
      <ActionModal
          isVisible={isVisibleAddRoleModal}
          modalRef={this.addRoleModalRef}
          onClickPrimary={this.updateRoleAssignment}
          onClose={this.closeModal}
          requestState={requestStates[ADD_ROLE_TO_MEMBER]}
          textTitle="Add Role To Member" />
    );
  }

  renderRemoveRoleModal = () => {

    const { requestStates } = this.props;
    const { isVisibleRemoveRoleModal } = this.state;

    return (
      <ActionModal
          isVisible={isVisibleRemoveRoleModal}
          modalRef={this.removeRoleModalRef}
          onClickPrimary={this.updateRoleAssignment}
          onClose={this.closeModal}
          requestState={requestStates[REMOVE_ROLE_FROM_MEMBER]}
          textTitle="Remove Role From Member" />
    );
  }

  render() {

    const { isOwner, match, org } = this.props;

    return (
      <Card>
        <CardSegment noBleed>
          <OrgRolesSection isOwner={isOwner} org={org} />
        </CardSegment>
        <CardSegment noBleed vertical>
          <SectionGrid>
            <h2>Role Assignments</h2>
            <RoleAssignmentsGrid>
              {this.renderRolesSection()}
              {this.renderMembersSection()}
            </RoleAssignmentsGrid>
          </SectionGrid>
        </CardSegment>
        {
          isOwner && (
            <CardSegment noBleed>
              <OrgRoleGrantsSection isOwner={isOwner} match={match} org={org} />
            </CardSegment>
          )
        }
        {this.renderAddRoleModal()}
        {this.renderRemoveRoleModal()}
      </Card>
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
      [GET_ORGANIZATION_ACLS]: state.getIn(['orgs', GET_ORGANIZATION_ACLS, 'requestState']),
      [REMOVE_ROLE_FROM_MEMBER]: state.getIn(['orgs', REMOVE_ROLE_FROM_MEMBER, 'requestState']),
    },
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
