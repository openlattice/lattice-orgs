/*
 * @flow
 */

import React, { Component } from 'react';

import { List, Map } from 'immutable';
import {
  ActionModal,
  Card,
  Input,
  MinusButton,
  PlusButton,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import { ActionControlWithButton, CompactCardSegment } from './styled';

import * as OrgsActions from '../OrgsActions';
import * as ReduxActions from '../../../core/redux/ReduxActions';
import { SectionGrid } from '../../../components';
import { Logger } from '../../../utils';
import { isNonEmptyString } from '../../../utils/LangUtils';
import type { ResetRequestStateAction } from '../../../core/redux/ReduxActions';

const { ADD_ROLE_TO_ORGANIZATION, REMOVE_ROLE_FROM_ORGANIZATION } = OrgsActions;

type Props = {
  actions :{
    addRoleToOrganization :RequestSequence;
    removeRoleFromOrganization :RequestSequence;
    resetRequestState :ResetRequestStateAction;
  };
  isOwner :boolean;
  org :Map;
  requestStates :{
    ADD_ROLE_TO_ORGANIZATION :RequestState;
    REMOVE_ROLE_FROM_ORGANIZATION :RequestState;
  };
};

type State = {
  isValidRole :boolean;
  isVisibleAddRoleModal :boolean;
  isVisibleRemoveRoleModal :boolean;
  selectedRoleId :?UUID;
  valueOfRoleTitle :string;
};

const LOG :Logger = new Logger('OrgRolesSection');

class OrgRolesSection extends Component<Props, State> {

  state = {
    isValidRole: true,
    isVisibleAddRoleModal: false,
    isVisibleRemoveRoleModal: false,
    selectedRoleId: undefined,
    valueOfRoleTitle: '',
  }

  handleOnChangeRoleTitle = (event :SyntheticInputEvent<HTMLInputElement>) => {

    const { org } = this.props;
    const valueOfRoleTitle :string = event.target.value || '';

    // always set isValidRole to true when typing, except if the value matches an existing role title
    this.setState({
      valueOfRoleTitle,
      isValidRole: this.isNewRole(org, valueOfRoleTitle),
    });
  }

  handleOnClickAddRole = () => {

    const { isOwner, org } = this.props;
    const { isVisibleAddRoleModal, isVisibleRemoveRoleModal, valueOfRoleTitle } = this.state;

    if (isVisibleAddRoleModal || isVisibleRemoveRoleModal) {
      // don't open modal while another modal is open, which can happen via keyboard tabbing in the bg
      return;
    }

    if (isOwner) {
      if (isNonEmptyString(valueOfRoleTitle) && this.isNewRole(org, valueOfRoleTitle)) {
        this.setState({
          isVisibleAddRoleModal: true,
          isVisibleRemoveRoleModal: false,
        });
      }
      else {
        // set isValidRole to false only when the button was clicked
        this.setState({ isValidRole: false });
      }
    }
  }

  handleOnClickRemoveRole = (event :SyntheticEvent<HTMLElement>) => {

    const { isVisibleAddRoleModal, isVisibleRemoveRoleModal } = this.state;

    if (isVisibleAddRoleModal || isVisibleRemoveRoleModal) {
      // don't open modal while another modal is open, which can happen via keyboard tabbing in the bg
      return;
    }

    const { currentTarget } = event;
    if (currentTarget instanceof HTMLElement) {
      const { dataset } = currentTarget;
      if (isNonEmptyString(dataset.roleId)) {
        this.setState({
          isVisibleAddRoleModal: false,
          isVisibleRemoveRoleModal: true,
          selectedRoleId: dataset.roleId,
        });
      }
      else {
        LOG.warn('target is missing expected data attributes: roleId', currentTarget);
      }
    }
    else {
      LOG.warn('target is not an HTMLElement', currentTarget);
    }
  }

  handleOnKeyDownRoleTitle = (event :SyntheticKeyboardEvent<HTMLInputElement>) => {

    switch (event.key) {
      case 'Enter':
        this.handleOnClickAddRole();
        break;
      default:
        break;
    }
  }

  isNewRole = (org :Map, roleTitle :string) => {

    return org
      .get('roles', List())
      .filter((role :Map) => role.get('title') === roleTitle)
      .isEmpty();
  }

  closeModal = () => {

    const { actions, requestStates } = this.props;
    const { isVisibleAddRoleModal } = this.state;

    if (isVisibleAddRoleModal) {
      /*
       * the "add" modal needs special handling. we want to keep "valueOfRoleTitle" if the modal was simply just
       * closed, i.e. the add action was not taken. we want to clear "valueOfRoleTitle" only when the add action
       * was actually taken
       */
      if (requestStates[ADD_ROLE_TO_ORGANIZATION] === RequestStates.STANDBY) {
        // clicking "cancel" instead of "confirm", i.e. closing the modal without taking action
        this.setState({
          isVisibleAddRoleModal: false,
        });
      }
      else {
        // clicking "close" after having clicked "confirm", i.e. closing the modal after taking action
        this.setState({
          isValidRole: true,
          isVisibleAddRoleModal: false,
          selectedRoleId: undefined,
          valueOfRoleTitle: '',
        });
        setTimeout(() => {
          actions.resetRequestState(ADD_ROLE_TO_ORGANIZATION);
        }, 1000);
      }
      return;
    }

    this.setState({
      isVisibleAddRoleModal: false,
      isVisibleRemoveRoleModal: false,
    });

    // the timeout avoids rendering the modal with new state before the transition animation finishes
    setTimeout(() => {
      actions.resetRequestState(ADD_ROLE_TO_ORGANIZATION);
      actions.resetRequestState(REMOVE_ROLE_FROM_ORGANIZATION);
    }, 1000);
  }

  addRoleToOrganization = () => {

    const { actions, isOwner, org } = this.props;
    const { valueOfRoleTitle } = this.state;

    if (isOwner) {
      actions.addRoleToOrganization({
        organizationId: org.get('id'),
        roleTitle: valueOfRoleTitle,
      });
    }
  }

  removeRoleFromOrganization = () => {

    const { actions, isOwner, org } = this.props;
    const { selectedRoleId } = this.state;

    if (isOwner) {
      actions.removeRoleFromOrganization({
        organizationId: org.get('id'),
        roleId: selectedRoleId,
      });
    }
  }

  renderAddRoleModal = () => {

    const { requestStates } = this.props;
    const { isVisibleAddRoleModal } = this.state;

    return (
      <ActionModal
          isVisible={isVisibleAddRoleModal}
          onClickPrimary={this.addRoleToOrganization}
          onClose={this.closeModal}
          requestState={requestStates[ADD_ROLE_TO_ORGANIZATION]}
          textTitle="Add Role To Organization" />
    );
  }

  renderRemoveRoleModal = () => {

    const { requestStates } = this.props;
    const { isVisibleRemoveRoleModal } = this.state;

    return (
      <ActionModal
          isVisible={isVisibleRemoveRoleModal}
          onClickPrimary={this.removeRoleFromOrganization}
          onClose={this.closeModal}
          requestState={requestStates[REMOVE_ROLE_FROM_ORGANIZATION]}
          textTitle="Remove Role From Organization" />
    );
  }

  render() {

    const { isOwner, org, requestStates } = this.props;
    const { isValidRole, valueOfRoleTitle } = this.state;

    const roleCardSegments = org.get('roles', List())
      .map((role :Map) => (
        <CompactCardSegment key={role.get('id')}>
          <span title={role.get('title')}>{role.get('title')}</span>
          <MinusButton
              disabled={!isOwner}
              data-role-id={role.get('id')}
              mode="negative"
              onClick={this.handleOnClickRemoveRole} />
        </CompactCardSegment>
      ));

    return (
      <SectionGrid>
        <h2>Roles</h2>
        {
          isOwner && (
            <div>
              <ActionControlWithButton>
                <Input
                    invalid={!isValidRole}
                    onChange={this.handleOnChangeRoleTitle}
                    onKeyDown={this.handleOnKeyDownRoleTitle}
                    placeholder="Add a new role"
                    value={valueOfRoleTitle} />
                <PlusButton
                    isLoading={requestStates[ADD_ROLE_TO_ORGANIZATION] === RequestStates.PENDING}
                    mode="positive"
                    onClick={this.handleOnClickAddRole} />
              </ActionControlWithButton>
            </div>
          )
        }
        <div>
          {
            roleCardSegments.isEmpty()
              ? (
                <i>No roles</i>
              )
              : (
                <Card>{roleCardSegments}</Card>
              )
          }
        </div>
        {this.renderAddRoleModal()}
        {this.renderRemoveRoleModal()}
      </SectionGrid>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  requestStates: {
    [ADD_ROLE_TO_ORGANIZATION]: state.getIn(['orgs', ADD_ROLE_TO_ORGANIZATION, 'requestState']),
    [REMOVE_ROLE_FROM_ORGANIZATION]: state.getIn(['orgs', REMOVE_ROLE_FROM_ORGANIZATION, 'requestState']),
  },
});

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    addRoleToOrganization: OrgsActions.addRoleToOrganization,
    removeRoleFromOrganization: OrgsActions.removeRoleFromOrganization,
    resetRequestState: ReduxActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgRolesSection);
