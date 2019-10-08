/*
 * @flow
 */

import React, { Component } from 'react';

import { List, Map } from 'immutable';
import { Models, Types } from 'lattice';
import { OrganizationsApiActions } from 'lattice-sagas';
import {
  Card,
  Input,
  MinusButton,
  PlusButton,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import * as ReduxActions from '../../../core/redux/ReduxActions';
import {
  ActionControlWithButton,
  CompactCardSegment,
  OrgDetailSectionGrid,
  OrgDetailSectionGridItem,
  SpinnerOverlayCard,
} from './styled';
import { isNonEmptyString } from '../../../utils/LangUtils';

const {
  Principal,
  PrincipalBuilder,
  Role,
  RoleBuilder,
} = Models;

const {
  PrincipalTypes,
} = Types;

const {
  CREATE_ROLE,
  DELETE_ROLE,
} = OrganizationsApiActions;

const ROLES_SUB_TITLE = `
You will be able to use the Roles below to manage permissions on Entity Sets that you own.
`;

type Props = {
  actions :{
    createRole :RequestSequence;
    deleteRole :RequestSequence;
    resetRequestState :(actionType :string) => void;
  };
  isOwner :boolean;
  org :Map;
  requestStates :{
    CREATE_ROLE :RequestState;
    DELETE_ROLE :RequestState;
  };
};

type State = {
  isValidRole :boolean;
  valueOfRole :string;
};

class OrgRolesSection extends Component<Props, State> {

  state = {
    isValidRole: true,
    valueOfRole: '',
  }

  handleOnChangeRole = (event :SyntheticInputEvent<HTMLInputElement>) => {

    const { isOwner } = this.props;
    const valueOfRole :string = event.target.value || '';

    if (isOwner) {
      // always set isValidRole to true when typing
      this.setState({ valueOfRole, isValidRole: true });
    }
  }

  handleOnClickAddRole = () => {

    const { actions, isOwner, org } = this.props;
    const { valueOfRole } = this.state;

    if (isOwner) {
      if (!isNonEmptyString(valueOfRole)) {
        // set to false only when the button was clicked
        this.setState({ isValidRole: false });
        return;
      }

      const principal :Principal = (new PrincipalBuilder())
        .setType(PrincipalTypes.ROLE)
        .setId(`${org.get('id')}|${valueOfRole.replace(/\W/g, '')}`)
        .build();

      const newRole :Role = (new RoleBuilder())
        .setOrganizationId(org.get('id'))
        .setPrincipal(principal)
        .setTitle(valueOfRole)
        .build();

      const isNewRole :boolean = org.get('roles', List())
        .filter((role :Map) => role.getIn(['principal', 'id']) === newRole.principal.id)
        .isEmpty();

      if (isNewRole) {
        actions.createRole(newRole);
      }
      else {
        // set isValidRole to false only when the button was clicked
        this.setState({ isValidRole: false });
      }
    }
  }

  handleOnClickRemoveRole = (role :Map) => {

    const { actions, isOwner, org } = this.props;

    if (isOwner) {
      actions.deleteRole({
        organizationId: org.get('id'),
        roleId: role.get('id'),
      });
    }
  }

  render() {

    const { isOwner, org, requestStates } = this.props;
    const { isValidRole } = this.state;

    const roles = org.get('roles', List());
    const roleCardSegments = roles.map((role :Map) => (
      <CompactCardSegment key={role.get('id')}>
        <span title={role.get('title')}>{role.get('title')}</span>
        {
          isOwner && (
            <MinusButton mode="negative" onClick={() => this.handleOnClickRemoveRole(role)} />
          )
        }
      </CompactCardSegment>
    ));

    return (
      <OrgDetailSectionGrid>
        <h2>Roles</h2>
        {
          isOwner && (
            <h4>{ROLES_SUB_TITLE}</h4>
          )
        }
        {
          isOwner && (
            <OrgDetailSectionGridItem>
              <ActionControlWithButton>
                <Input
                    invalid={!isValidRole}
                    onChange={this.handleOnChangeRole}
                    placeholder="Add a new role" />
                <PlusButton
                    isLoading={requestStates[CREATE_ROLE] === RequestStates.PENDING}
                    mode="positive"
                    onClick={this.handleOnClickAddRole} />
              </ActionControlWithButton>
            </OrgDetailSectionGridItem>
          )
        }
        <OrgDetailSectionGridItem>
          {
            roleCardSegments.isEmpty()
              ? (
                <i>No roles</i>
              )
              : (
                <Card>{roleCardSegments}</Card>
              )
          }
          {
            !roleCardSegments.isEmpty() && requestStates[DELETE_ROLE] === RequestStates.PENDING && (
              <SpinnerOverlayCard />
            )
          }
        </OrgDetailSectionGridItem>
      </OrgDetailSectionGrid>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => ({
  requestStates: {
    [CREATE_ROLE]: state.getIn(['orgs', CREATE_ROLE, 'requestState']),
    [DELETE_ROLE]: state.getIn(['orgs', DELETE_ROLE, 'requestState']),
  },
});

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    createRole: OrganizationsApiActions.createRole,
    deleteRole: OrganizationsApiActions.deleteRole,
    resetRequestState: ReduxActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgRolesSection);
