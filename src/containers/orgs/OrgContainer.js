/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
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

import OrgDetailsContainer from './OrgDetailsContainer';
import OrgEntitySetsContainer from './OrgEntitySetsContainer';
import OrgPermissionsContainer from './OrgPermissionsContainer';
import * as OrgsActions from './OrgsActions';
import * as ReduxActions from '../../core/redux/ReduxActions';
import * as Routes from '../../core/router/Routes';
import * as RoutingActions from '../../core/router/RoutingActions';
import { OrgTitleSection } from './components';
import { getIdFromMatch } from '../../core/router/RouterUtils';
import { isValidUUID } from '../../utils/ValidationUtils';
import type { GoToRoot } from '../../core/router/RoutingActions';

const { NEUTRALS } = Colors;

const {
  GET_ORGANIZATION_DETAILS,
} = OrgsActions;

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
  font-weight: 500;
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

type Props = {
  actions :{
    getOrganizationDetails :RequestSequence;
    goToRoot :GoToRoot;
    resetRequestState :(actionType :string) => void;
  };
  isOwner :boolean;
  match :Match;
  org :Map;
  requestStates :{
    GET_ORGANIZATION_DETAILS :RequestState;
  };
};

class OrgContainer extends Component<Props> {

  componentDidMount() {

    const { actions, match } = this.props;
    const orgId :?UUID = getIdFromMatch(match);

    if (!isValidUUID(orgId)) {
      actions.goToRoot();
    }
    else {
      actions.getOrganizationDetails(orgId);
    }
  }

  componentDidUpdate(prevProps :Props) {

    const { actions, match, requestStates } = this.props;
    const orgId :?UUID = getIdFromMatch(match);
    const prevOrgId :?UUID = getIdFromMatch(prevProps.match);

    if (!isValidUUID(orgId)) {
      actions.goToRoot();
    }
    else {
      if (orgId !== prevOrgId) {
        actions.getOrganizationDetails(orgId);
      }
      if (prevProps.requestStates[GET_ORGANIZATION_DETAILS] === RequestStates.PENDING
          && requestStates[GET_ORGANIZATION_DETAILS] === RequestStates.SUCCESS) {
        actions.resetRequestState(GET_ORGANIZATION_DETAILS);
      }
      else if (prevProps.requestStates[GET_ORGANIZATION_DETAILS] === RequestStates.PENDING
          && requestStates[GET_ORGANIZATION_DETAILS] === RequestStates.FAILURE) {
        actions.goToRoot();
      }
    }
  }

  componentWillUnmount() {

    const { actions } = this.props;
    actions.resetRequestState(GET_ORGANIZATION_DETAILS);
  }

  render() {

    const { isOwner, org, requestStates } = this.props;

    if (requestStates[GET_ORGANIZATION_DETAILS] === RequestStates.PENDING) {
      return (
        <Spinner size="2x" />
      );
    }

    const orgId :UUID = org.get('id');

    return (
      <>
        <OrgTitleSection isOwner={isOwner} org={org} />
        <Tabs>
          <OrgNavLink exact to={Routes.ORG.replace(Routes.ID_PARAM, orgId)}>
            Organization Details
          </OrgNavLink>
          {
            isOwner && (
              <OrgNavLink exact to={Routes.ORG_PERMISSIONS.replace(Routes.ID_PARAM, orgId)}>
                Permissions
              </OrgNavLink>
            )
          }
          <OrgNavLink exact to={Routes.ORG_ENTITY_SETS.replace(Routes.ID_PARAM, orgId)}>
            Entity Sets
          </OrgNavLink>
        </Tabs>
        <Switch>
          <Route exact path={Routes.ORG} component={OrgDetailsContainer} />
          <Route path={Routes.ORG_ENTITY_SETS} component={OrgEntitySetsContainer} />
          {
            isOwner && (
              <Route path={Routes.ORG_PERMISSIONS} component={OrgPermissionsContainer} />
            )
          }
        </Switch>
      </>
    );
  }
}

const mapStateToProps = (state :Map, props) => {

  const orgId :?UUID = getIdFromMatch(props.match);

  return {
    isOwner: state.hasIn(['orgs', 'isOwnerOfOrgIds', orgId], false),
    org: state.getIn(['orgs', 'orgs', orgId], Map()),
    requestStates: {
      [GET_ORGANIZATION_DETAILS]: state.getIn(['orgs', GET_ORGANIZATION_DETAILS, 'requestState']),
    },
  };
};

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    getOrganizationDetails: OrgsActions.getOrganizationDetails,
    goToRoot: RoutingActions.goToRoot,
    resetRequestState: ReduxActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgContainer);
