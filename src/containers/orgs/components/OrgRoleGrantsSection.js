/*
 * @flow
 */

import React, { Component } from 'react';

import { List, Map } from 'immutable';
import { Models, Types } from 'lattice';
import { AuthUtils } from 'lattice-auth';
import { OrganizationsApiActions } from 'lattice-sagas';
import {
  ActionModal,
  Creatable,
  EditButton,
  Select,
  Table,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { GrantType } from 'lattice';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import { SelectControlWithButton } from './styled';

import * as ReduxActions from '../../../core/redux/ReduxActions';
import { ModalBodyMinWidth, SectionGrid } from '../../../components';
import { getRoleSelectOptions } from '../OrgsUtils';

const { Grant, GrantBuilder } = Models;
const { GrantTypes } = Types;

type GrantTypeSelectOption = {|
  label :GrantType;
  value :GrantType;
|};

const GRANT_TYPE_SELECT_OPTIONS :GrantTypeSelectOption[] = Object.keys(GrantTypes).map((gtKey :string) => ({
  label: GrantTypes[gtKey],
  value: GrantTypes[gtKey],
}));

const { UPDATE_ROLE_GRANT } = OrganizationsApiActions;

const GRANT_TABLE_HEADERS = [
  {
    key: 'grantType',
    label: 'Grant Type',
  },
  {
    key: 'mappings',
    label: 'Mappings',
  },
  {
    cellStyle: { width: '100px' },
    key: 'button',
    label: '',
    sortable: false,
  },
];

type Props = {
  actions :{
    resetRequestState :(actionType :string) => void;
    updateRoleGrant :RequestSequence;
  };
  isOwner :boolean;
  org :Map;
  requestStates :{
    UPDATE_ROLE_GRANT :RequestState;
  };
};

type State = {
  isVisibleGrantModal :boolean;
  roleSelectOptions :ReactSelectOption[];
  selectedGrantMappings :?string[];
  selectedGrantType :?GrantType;
  selectedRoleId :?UUID;
};

class OrgRoleGrantsContainer extends Component<Props, State> {

  constructor(props :Props) {

    super(props);

    this.state = {
      isVisibleGrantModal: false,
      roleSelectOptions: getRoleSelectOptions(props.org),
      selectedGrantMappings: undefined,
      selectedGrantType: undefined,
      selectedRoleId: props.org.get('roles', List()).get(0, Map()).get('id'),
    };
  }

  componentDidUpdate(props :Props) {

    const { org } = this.props;

    if (!org.equals(props.org)) {
      this.setState({
        isVisibleGrantModal: false,
        roleSelectOptions: getRoleSelectOptions(org),
        selectedGrantMappings: undefined,
        selectedGrantType: undefined,
        selectedRoleId: org.get('roles', List()).get(0, Map()).get('id'),
      });
    }
  }

  handleOnChangeSelectGrantMappings = (selectedOptions :?ReactSelectOption[]) => {

    const selectedGrantMappings :string[] = selectedOptions
      ? selectedOptions.map((selectedOption) => selectedOption.value)
      : [];

    this.setState({
      selectedGrantMappings,
    });
  }

  handleOnChangeSelectGrantType = (selectedOption :?GrantTypeSelectOption) => {

    const selectedGrantType :?GrantType = selectedOption && selectedOption.label
      ? selectedOption.label
      : undefined;

    this.setState({
      selectedGrantType,
    });
  }

  handleOnChangeSelectedRole = (selectedOption :?ReactSelectOption) => {

    const selectedRoleId = selectedOption && selectedOption.value
      ? selectedOption.value
      : undefined;

    this.setState({
      selectedRoleId,
    });
  }

  closeModal = () => {

    const { actions } = this.props;

    this.setState({
      isVisibleGrantModal: false,
      selectedGrantMappings: undefined,
      selectedGrantType: undefined,
    });

    // the timeout avoids rendering the modal with new state before the transition animation finishes
    setTimeout(() => {
      actions.resetRequestState(UPDATE_ROLE_GRANT);
    }, 1000);
  }

  openModal = () => {

    const { org } = this.props;
    const { selectedRoleId } = this.state;

    const role :Map = org.get('roles', List()).find(
      (r :Map) => r.get('id') === selectedRoleId,
      null,
      Map(),
    );

    if (!role || role.isEmpty()) {
      return;
    }

    const roleGrant :Map = org.getIn(['grants', selectedRoleId], Map());
    const selectedGrantMappings :string[] = roleGrant.get('mappings', List()).toJS();
    const selectedGrantType :GrantType = roleGrant.get('grantType');

    this.setState({
      selectedGrantMappings,
      selectedGrantType,
      isVisibleGrantModal: true,
    });
  }

  updateRoleGrant = () => {

    const { actions, isOwner, org } = this.props;
    const { selectedGrantMappings, selectedGrantType, selectedRoleId } = this.state;

    if (AuthUtils.isAdmin() && isOwner) {
      if (selectedGrantMappings && selectedGrantType && selectedRoleId) {
        const grant :Grant = (new GrantBuilder())
          .setGrantType(selectedGrantType)
          .setMappings(selectedGrantMappings)
          .build();
        actions.updateRoleGrant({
          grant,
          organizationId: org.get('id'),
          roleId: selectedRoleId,
        });
      }
    }
  }

  renderGrantModal = () => {

    const { org, requestStates } = this.props;
    const {
      isVisibleGrantModal,
      selectedGrantMappings,
      selectedGrantType,
      selectedRoleId,
    } = this.state;

    const role :Map = org.get('roles', List()).find(
      (r :Map) => r.get('id') === selectedRoleId,
      null,
      Map(),
    );

    let selectedOptions :ReactSelectOption[] = [];
    if (selectedGrantMappings) {
      selectedOptions = selectedGrantMappings.map((mapping :string) => ({ label: mapping, value: mapping }));
    }

    const requestStateComponents = {
      [RequestStates.STANDBY]: (
        <ModalBodyMinWidth>
          <Select
              defaultValue={{ label: selectedGrantType, value: selectedGrantType }}
              onChange={this.handleOnChangeSelectGrantType}
              options={GRANT_TYPE_SELECT_OPTIONS} />
          {
            selectedGrantType !== GrantTypes.AUTOMATIC && (
              <>
                <br />
                <Creatable
                    defaultValue={selectedOptions}
                    isMulti
                    onChange={this.handleOnChangeSelectGrantMappings} />
              </>
            )
          }
        </ModalBodyMinWidth>
      ),
    };

    return (
      <ActionModal
          isVisible={isVisibleGrantModal}
          onClickPrimary={this.updateRoleGrant}
          onClose={this.closeModal}
          requestState={requestStates[UPDATE_ROLE_GRANT]}
          requestStateComponents={requestStateComponents}
          textPrimary="Update"
          textTitle={role.get('title')}
          viewportScrolling />
    );
  }

  render() {

    const { org } = this.props;
    const { roleSelectOptions, selectedRoleId } = this.state;
    const roleGrant :Map = org.getIn(['grants', selectedRoleId], Map());

    const data = [{
      button: <EditButton onClick={this.openModal} />,
      grantType: roleGrant.get('grantType'),
      id: 'roleGrant', // for now, there can only be one grant per role
      mappings: roleGrant.get('mappings', List()).join(' , '),
    }];

    return (
      <SectionGrid>
        <h2>Role Grants</h2>
        <SelectControlWithButton>
          <Select
              defaultValue={roleSelectOptions[0]}
              options={roleSelectOptions}
              onChange={this.handleOnChangeSelectedRole} />
        </SelectControlWithButton>
        <Table data={data} headers={GRANT_TABLE_HEADERS} />
        {this.renderGrantModal()}
      </SectionGrid>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  requestStates: {
    [UPDATE_ROLE_GRANT]: state.getIn(['orgs', UPDATE_ROLE_GRANT, 'requestState']),
  }
});

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    resetRequestState: ReduxActions.resetRequestState,
    updateRoleGrant: OrganizationsApiActions.updateRoleGrant,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgRoleGrantsContainer);
