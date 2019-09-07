/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import {
  Card,
  CardSegment,
  Colors,
  Spinner,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { Match } from 'react-router';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import DeleteOrgModal from './components/DeleteOrgModal';
import OrgDetailSectionGrid from './components/styled/OrgDetailSectionGrid';
import OrgDescriptionSection from './components/OrgDescriptionSection';
import OrgDomainsSection from './components/OrgDomainsSection';
import OrgIntegrationSection from './components/OrgIntegrationSection';
import OrgMembersSection from './components/OrgMembersSection';
import OrgRolesSection from './components/OrgRolesSection';
import OrgTrustedOrgsSection from './components/OrgTrustedOrgsSection';
import * as OrgsActions from './OrgsActions';
import * as ReduxActions from '../../core/redux/ReduxActions';
import * as Routes from '../../core/router/Routes';
import * as RoutingActions from '../../core/router/RoutingActions';
import { isNonEmptyString } from '../../utils/LangUtils';
import { isValidUUID } from '../../utils/ValidationUtils';
import type { GoToRoot } from '../../core/router/RoutingActions';

const { NEUTRALS } = Colors;

const {
  ADD_MEMBER_TO_ORG,
  DELETE_ORGANIZATION,
} = OrganizationsApiActions;

const {
  GET_ORGANIZATION_DETAILS,
} = OrgsActions;

const OrgTitle = styled.h1`
  font-size: 28px;
  font-weight: normal;
  margin: 20px 0 0 0;
  padding: 0;
`;

const Tabs = styled.div`
  display: flex;
  justify-content: flex-start;
  margin: 30px 0 50px 0;
`;

const OrgNavLink = styled(NavLink)`
  align-items: center;
  border-bottom: 2px solid transparent;
  color: ${NEUTRALS[1]};
  font-size: 18px;
  font-weight: 600;
  line-height: 70px;
  margin-right: 40px;
  outline: none;
  text-decoration: none;

  &:focus {
    text-decoration: none;
  }

  &:hover {
    color: ${NEUTRALS[0]};
    cursor: pointer;
    outline: none;
    text-decoration: none;
  }

  &.active {
    border-bottom: 2px solid #674fef;
    color: #674fef;
  }
`;

const OrgDescriptionSegment = styled(CardSegment)`
  justify-content: space-between;
`;

type Props = {
  actions :{
    getOrganizationDetails :RequestSequence;
    deleteOrganization :RequestSequence;
    goToRoot :GoToRoot;
    resetRequestState :(actionType :string) => void;
  };
  isOwner :boolean;
  match :Match;
  org :Map;
  requestStates :{
    ADD_MEMBER_TO_ORG :RequestState;
    DELETE_ORGANIZATION :RequestState;
    GET_ORGANIZATION_DETAILS :RequestState;
  };
};

class OrgContainer extends Component<Props> {

  componentDidMount() {

    const { actions, match } = this.props;
    const { params: { id: orgId = null } = {} } = match;

    if (!isValidUUID(orgId)) {
      actions.goToRoot();
    }
    else {
      actions.getOrganizationDetails(orgId);
    }
  }

  componentDidUpdate(prevProps :Props) {

    const { actions, match, requestStates } = this.props;
    const { params: { id: orgId = null } = {} } = match;
    const { params: { id: prevOrgId = null } = {} } = prevProps.match;

    if (!isValidUUID(orgId)) {
      actions.goToRoot();
    }
    else {
      if (orgId !== prevOrgId) {
        actions.getOrganizationDetails(orgId);
      }
      if (requestStates[GET_ORGANIZATION_DETAILS] === RequestStates.SUCCESS
          && prevProps.requestStates[GET_ORGANIZATION_DETAILS] === RequestStates.PENDING) {
        actions.resetRequestState(GET_ORGANIZATION_DETAILS);
      }
      else if (requestStates[GET_ORGANIZATION_DETAILS] === RequestStates.FAILURE
          && prevProps.requestStates[GET_ORGANIZATION_DETAILS] === RequestStates.PENDING) {
        actions.goToRoot();
      }
      if (requestStates[ADD_MEMBER_TO_ORG] === RequestStates.SUCCESS
          && prevProps.requestStates[ADD_MEMBER_TO_ORG] === RequestStates.PENDING) {
        actions.getOrganizationDetails(orgId);
      }
      if (requestStates[DELETE_ORGANIZATION] === RequestStates.SUCCESS
          && prevProps.requestStates[DELETE_ORGANIZATION] === RequestStates.PENDING) {
        actions.goToRoot();
      }
    }
  }

  componentWillUnmount() {

    const { actions } = this.props;
    actions.resetRequestState(GET_ORGANIZATION_DETAILS);
  }

  renderOrgDetails = () => {

    return (
      <Card>
        {this.renderOrgDescriptionSegment()}
        {this.renderIntegrationSegment()}
        {this.renderDomainsAndTrustedOrgsSegment()}
        {this.renderRolesAndMembersSegment()}
      </Card>
    );
  }

  renderOrgDescriptionSegment = () => {

    const { isOwner, org } = this.props;
    const description :string = org.get('description', '');

    if (!isOwner && !isNonEmptyString(description)) {
      return null;
    }

    return (
      <OrgDescriptionSegment noBleed>
        <OrgDescriptionSection isOwner={isOwner} org={org} />
      </OrgDescriptionSegment>
    );
  }

  renderIntegrationSegment = () => {

    const { isOwner, org } = this.props;
    if (!isOwner) {
      return null;
    }

    const integration :Map = org.get('integration', Map());
    if (integration.isEmpty()) {
      return null;
    }

    return (
      <CardSegment noBleed vertical>
        <OrgIntegrationSection isOwner={isOwner} org={org} />
      </CardSegment>
    );
  }

  renderDomainsAndTrustedOrgsSegment = () => {

    const { isOwner, org } = this.props;

    return (
      <CardSegment noBleed vertical>
        <OrgDetailSectionGrid columns={2}>
          <OrgDomainsSection isOwner={isOwner} org={org} />
          <OrgTrustedOrgsSection isOwner={isOwner} org={org} />
        </OrgDetailSectionGrid>
      </CardSegment>
    );
  }

  renderRolesAndMembersSegment = () => {

    const { isOwner, org } = this.props;

    return (
      <CardSegment noBleed vertical>
        <OrgDetailSectionGrid columns={2}>
          <OrgRolesSection isOwner={isOwner} org={org} />
          <OrgMembersSection isOwner={isOwner} org={org} />
        </OrgDetailSectionGrid>
        {
          isOwner && (
            <DeleteOrgModal org={org} />
          )
        }
      </CardSegment>
    );
  }

  renderPermissions = () => {

    return (
      <Card>
        <CardSegment vertical>
          Manage Permissions
        </CardSegment>
      </Card>
    );
  }

  renderEntitySets = () => {

    return (
      <Card>
        <CardSegment vertical>
          Entity Set
        </CardSegment>
      </Card>
    );
  }

  render() {

    const { org, requestStates } = this.props;

    if (requestStates[GET_ORGANIZATION_DETAILS] === RequestStates.PENDING) {
      return (
        <Spinner size="2x" />
      );
    }

    return (
      <>
        <OrgTitle>{org.get('title')}</OrgTitle>
        <Tabs>
          <OrgNavLink exact to={Routes.ORG.replace(Routes.ID_PATH, org.get('id'))}>
            Organization Details
          </OrgNavLink>
          <OrgNavLink exact to={Routes.ORG_PERMISSIONS.replace(Routes.ID_PATH, org.get('id'))}>
            Permissions
          </OrgNavLink>
          <OrgNavLink exact to={Routes.ORG_ENTITY_SETS.replace(Routes.ID_PATH, org.get('id'))}>
            Entity Sets
          </OrgNavLink>
        </Tabs>
        <Switch>
          <Route path={Routes.ORG_PERMISSIONS} render={this.renderPermissions} />
          <Route path={Routes.ORG_ENTITY_SETS} render={this.renderEntitySets} />
          <Route render={this.renderOrgDetails} />
        </Switch>
      </>
    );
  }
}

const mapStateToProps = (state :Map<*, *>, props) => {

  const {
    params: {
      id: orgId = null,
    } = {},
  } = props.match;

  return {
    isOwner: state.hasIn(['orgs', 'isOwnerOfOrgIds', orgId], false),
    org: state.getIn(['orgs', 'orgs', orgId], Map()),
    orgs: state.getIn(['orgs', 'orgs'], Map()),
    requestStates: {
      [ADD_MEMBER_TO_ORG]: state.getIn(['orgs', ADD_MEMBER_TO_ORG, 'requestState']),
      [DELETE_ORGANIZATION]: state.getIn(['orgs', DELETE_ORGANIZATION, 'requestState']),
      [GET_ORGANIZATION_DETAILS]: state.getIn(['orgs', GET_ORGANIZATION_DETAILS, 'requestState']),
    },
  };
};

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    getOrganizationDetails: OrgsActions.getOrganizationDetails,
    deleteOrganization: OrganizationsApiActions.deleteOrganization,
    goToRoot: RoutingActions.goToRoot,
    resetRequestState: ReduxActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgContainer);
