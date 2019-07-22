/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/pro-solid-svg-icons';
import { List, Map } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import {
  Card,
  CardHeader,
  CardSegment,
  Colors,
  Spinner,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import * as Routes from '../../core/router/Routes';
import * as RoutingActions from '../../core/router/RoutingActions';
import type { GoToRoute } from '../../core/router/RoutingActions';

// const LOG = new Logger('OrgsContainer');

const { NEUTRALS } = Colors;

const Title = styled.h1`
  font-size: 28px;
  font-weight: normal;
  margin: 20px 0 40px 0;
  padding: 0;
`;

const CardGrid = styled.div`
  display: grid;
  grid-gap: 30px;
  grid-template-columns: 1fr 1fr;
`;

const OrgName = styled.h2`
  font-size: 18px;
  font-weight: normal;
  margin: 0;
  padding: 0;
`;

const OrgSegment = styled.div`
  display: grid;
  grid-gap: 15px;
  grid-template-columns: 1fr;
`;

const OrgMetaWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  font-size: 14px;
`;

const UserIcon = styled(FontAwesomeIcon).attrs({
  icon: faUser
})`
  margin-right: 10px;
`;

const OrgDescription = styled.p`
  color: ${NEUTRALS[1]};
  font-size: 14px;
  font-weight: normal;
  margin: 0;
  padding: 0;
`;

type Props = {
  actions :{
    getAllOrganizations :RequestSequence;
    goToRoute :GoToRoute;
  };
  getAllOrgsRequestState :RequestState;
  organizations :List<Map>;
};

class OrgsContainer extends Component<Props> {

  componentDidMount() {
    const { actions } = this.props;
    actions.getAllOrganizations();
  }

  goToOrg = (org :Map) => {
    const { actions } = this.props;
    const orgId :UUID = org.get('id');
    actions.goToRoute(Routes.ORG.replace(Routes.ID_PATH, orgId));
  }

  renderOrgCard = (org :Map) => (
    <Card key={org.get('id')} onClick={() => this.goToOrg(org)}>
      <CardHeader padding="md">
        <OrgName>{org.get('title', '')}</OrgName>
      </CardHeader>
      <CardSegment>
        <OrgSegment>
          <OrgMetaWrapper>
            <UserIcon />
            <span>{org.get('members', List()).count()}</span>
          </OrgMetaWrapper>
          <OrgDescription>
            {org.get('description', '')}
          </OrgDescription>
        </OrgSegment>
      </CardSegment>
    </Card>
  )

  render() {

    const { getAllOrgsRequestState, organizations } = this.props;

    if (getAllOrgsRequestState === RequestStates.PENDING) {
      return (
        <Spinner centered size="2x" />
      );
    }

    return (
      <>
        <Title>Organizations</Title>
        <CardGrid>
          {organizations.map((org :Map) => this.renderOrgCard(org))}
        </CardGrid>
      </>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => ({
  getAllOrgsRequestState: state.getIn(['orgs', OrganizationsApiActions.GET_ALL_ORGANIZATIONS, 'requestState']),
  organizations: state.getIn(['orgs', 'orgs']),
});

const mapDispatchToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    getAllOrganizations: OrganizationsApiActions.getAllOrganizations,
    goToRoute: RoutingActions.goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(OrgsContainer);
