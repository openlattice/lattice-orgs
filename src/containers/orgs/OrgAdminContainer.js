/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { faTrashAlt } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import { AuthUtils } from 'lattice-auth';
import { OrganizationsApiActions } from 'lattice-sagas';
import {
  ActionModal,
  Card,
  CardSegment,
  Creatable,
  EditButton,
  Select,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { Match } from 'react-router';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import * as OrgsActions from './OrgsActions';
import * as ReduxActions from '../../core/redux/ReduxActions';
import * as Routes from '../../core/router/Routes';
import * as RoutingActions from '../../core/router/RoutingActions';
import { ModalBodyMinWidth, SectionGrid } from '../../components';
import { getIdFromMatch } from '../../core/router/RouterUtils';
import { Logger } from '../../utils';
import { isValidUUID } from '../../utils/ValidationUtils';
import { OrgConnectionsSection } from './components';
import { SelectControlWithButton } from './components/styled';
import type { GoToRoot, GoToRoute } from '../../core/router/RoutingActions';

type Props = {
  actions :{
    goToRoot :GoToRoot;
    goToRoute :GoToRoute;
    resetRequestState :(actionType :string) => void;
  };
  isOwner :boolean;
  match :Match;
  org :Map;
  requestStates :{};
};

type State = {
  isVisibleAddGrantModal :boolean;
  selectedRoleId :?UUID;
};

const LOG :Logger = new Logger('OrgAdminContainer');

class OrgAdminContainer extends Component<Props, State> {

  constructor(props :Props) {

    super(props);

    this.state = {
      isVisibleAddGrantModal: false,
      selectedRoleId: undefined,
    };
  }

  handleOnChangeRoleGrantMapping = () => {

  }

  handleOnChangeSelectedRole = (selectedOption :?{ label :string; value :string }) => {

    const selectedRoleId = selectedOption && selectedOption.value
      ? selectedOption.value
      : undefined;

    this.setState({
      selectedRoleId,
    });
  }

  closeModal = () => {

    this.setState({
      isVisibleAddGrantModal: false,
    });
  }

  openModal = () => {

    const { selectedRoleId } = this.state;
    if (!selectedRoleId) {
      return;
    }

    this.setState({
      isVisibleAddGrantModal: true,
    });
  }

  getRoleSelectOptions = () => {

    const { org } = this.props;
    const roles = org.get('roles', List());

    return roles.valueSeq().map((role :Map) => ({
      label: role.get('title'),
      value: role.get('id'),
    }));
  }

  renderAddRoleModal = () => {

    const { org, requestStates } = this.props;
    const { isVisibleAddGrantModal, selectedRoleId } = this.state;

    const role = org.get('roles', List()).find(
      (r :Map) => r.get('id') === selectedRoleId,
      null,
      Map(),
    );

    const requestStateComponents = {
      [RequestStates.STANDBY]: (
        <ModalBodyMinWidth>
          <Creatable
              hideMenu
              isClearable
              isMulti />
        </ModalBodyMinWidth>
      ),
    };

    return (
      <ActionModal
          isVisible={isVisibleAddGrantModal}
          onClose={this.closeModal}
          requestStateComponents={requestStateComponents}
          textPrimary="Update"
          textTitle={role.get('title')} />
    );
  }

  render() {

    const { isOwner, match, org } = this.props;

    if (!AuthUtils.isAdmin()) {
      const orgId :?UUID = getIdFromMatch(match);
      if (isValidUUID(orgId)) {
        return <Redirect to={Routes.ORG.replace(Routes.ID_PARAM, orgId)} />;
      }
      return <Redirect to={Routes.ROOT} />;
    }

    return (
      <Card>
        <CardSegment noBleed>
          <OrgConnectionsSection isOwner={isOwner} org={org} />
        </CardSegment>
        <CardSegment>
          <SectionGrid columns={2}>
            <SectionGrid>
              <h2>Role Grants</h2>
              <SelectControlWithButton>
                <Select
                    isClearable
                    options={this.getRoleSelectOptions()}
                    onChange={this.handleOnChangeSelectedRole}
                    placeholder="Select a role" />
                <EditButton
                    mode="default"
                    onClick={this.openModal} />
              </SelectControlWithButton>
            </SectionGrid>
          </SectionGrid>
        </CardSegment>
        {this.renderAddRoleModal()}
      </Card>
    );
  }
}

const mapStateToProps = (state :Map, props :Object) => {

  const orgId :?UUID = getIdFromMatch(props.match);

  return {
    isOwner: state.hasIn(['orgs', 'isOwnerOfOrgIds', orgId], false),
    org: state.getIn(['orgs', 'orgs', orgId], Map()),
    orgs: state.getIn(['orgs', 'orgs'], Map()),
    requestStates: {},
  };
};

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    goToRoot: RoutingActions.goToRoot,
    goToRoute: RoutingActions.goToRoute,
    resetRequestState: ReduxActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgAdminContainer);
