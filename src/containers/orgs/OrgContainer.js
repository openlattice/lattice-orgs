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
import type { RequestSequence, RequestState } from 'redux-reqseq';

import * as ReduxActions from '../../core/redux/ReduxActions';
import * as Routes from '../../core/router/Routes';

const { NEUTRALS } = Colors;
const { GET_ORGANIZATION } = OrganizationsApiActions;

const OrgTitle = styled.h1`
  font-size: 28px;
  font-weight: normal;
  margin: 20px 0 0 0;
  padding: 0;
`;

const OrgDescription = styled.h3`
  font-size: 20px;
  font-weight: normal;
  margin: 0;
  padding: 0;
`;

const Grid = styled.div`
  display: grid;
  grid-gap: 30px;
  grid-template-columns: 1fr 1fr;
`;

const GridItem = styled.div`
  word-break: break-word;
`;

const SegmentTitle = styled.h2`
  font-size: 22px;
  font-weight: 600;
  grid-column: 1 / span 2;
  margin: 0;
`;

const SectionTitle = styled.h4`
  color: ${NEUTRALS[1]};
  font-size: 14px;
`;

const Divider = styled.div`
  background-color: ${NEUTRALS[4]};
  height: 1px;
  margin: 48px 0;
`;

const Tabs = styled.div`
  display: flex;
  justify-content: flex-start;
  margin: 30px 0 50px 0;
`;

const ORG_NAV_LINK_ACTIVE :string = 'org-nav-link-active';

const OrgNavLink = styled(NavLink).attrs({
  activeClassName: ORG_NAV_LINK_ACTIVE
})`
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

  &.${ORG_NAV_LINK_ACTIVE} {
    border-bottom: 2px solid #674fef;
    color: #674fef;
  }
`;

type Props = {
  actions :{
    getOrganization :RequestSequence;
    resetRequestState :(actionType :string) => void;
  };
  org :Map;
  orgId :UUID;
  requestStates :{
    [typeof GET_ORGANIZATION] :RequestState;
  };
};

class OrgContainer extends Component<Props> {

  componentDidMount() {

    const { actions, org, orgId } = this.props;
    if (!org || org.isEmpty()) {
      actions.getOrganization(orgId);
    }
  }

  componentDidUpdate(prevProps :Props) {

    const { actions, orgId, requestStates } = this.props;
    if (orgId !== prevProps.orgId) {
      actions.getOrganization(orgId);
    }

    if (requestStates[GET_ORGANIZATION] === RequestStates.SUCCESS
        && prevProps.requestStates[GET_ORGANIZATION] === RequestStates.PENDING) {
      actions.resetRequestState(GET_ORGANIZATION);
    }
  }

  componentWillUnmount() {

    const { actions } = this.props;
    actions.resetRequestState(GET_ORGANIZATION);
  }

  renderOrgDetails = () => {

    const { org } = this.props;

    const jdbcURL = `jdbc:postgresql://atlas.openlattice.com:30001/org_${org.get('id', '').replace(/-/g, '')}`;
    const user = `ol-internal|organization|${org.get('id')}`;

    return (
      <Card>
        <CardSegment vertical>
          <OrgDescription>{org.get('description')}</OrgDescription>
          <Divider />
          <Grid>
            <GridItem>
              <SegmentTitle>Integration Account Details</SegmentTitle>
              <SectionTitle>JDBC URL</SectionTitle>
              <div>{jdbcURL}</div>
            </GridItem>
            <GridItem>
              <SectionTitle>USER</SectionTitle>
              <div>{user}</div>
            </GridItem>
            <GridItem>
              <SectionTitle>CREDENTIAL</SectionTitle>
              <div>...</div>
            </GridItem>
          </Grid>
          <Divider />
          <Grid>
            <GridItem>
              <SegmentTitle>Domains</SegmentTitle>
              <div>Users from these domains will automatically be approved when requesting to join this organization.</div>
              <div>No domains</div>
            </GridItem>
            <GridItem>
              <SegmentTitle>Trusted Organizations</SegmentTitle>
              <div>Organizations listed here and all their members will be able to see this organization and all its roles.</div>
              <div>No trusted organizations</div>
            </GridItem>
          </Grid>
        </CardSegment>
      </Card>
    );
  }

  renderPermissions = () => {

    return (
      <Card>
        <CardSegment vertical>
          <CardSegmentGrid>
            <SegmentTitle>Manage Permissions</SegmentTitle>
          </CardSegmentGrid>
        </CardSegment>
      </Card>
    );
  }

  renderEntitySets = () => {

    return (
      <Card>
        <CardSegment vertical>
          <CardSegmentGrid>
            <SegmentTitle>Entity Set</SegmentTitle>
          </CardSegmentGrid>
        </CardSegment>
      </Card>
    );
  }

  render() {

    const { org, requestStates } = this.props;

    if (requestStates[GET_ORGANIZATION] === RequestStates.PENDING) {
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
    orgId,
    org: state.getIn(['orgs', 'orgs', orgId], Map()),
    requestStates: {
      [GET_ORGANIZATION]: state.getIn(['orgs', GET_ORGANIZATION, 'requestState']),
    },
  };
};

const mapDispatchToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    getOrganization: OrganizationsApiActions.getOrganization,
    resetRequestState: ReduxActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(OrgContainer);
