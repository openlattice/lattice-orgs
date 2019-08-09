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
import * as ReduxActions from '../../core/redux/ReduxActions';
import * as RoutingActions from '../../core/router/RoutingActions';
import type { GoToRoute } from '../../core/router/RoutingActions';

// const LOG = new Logger('OrgsContainer');

const { NEUTRALS } = Colors;
const { GET_ALL_ORGANIZATIONS } = OrganizationsApiActions;

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

const Error = styled.div`
  text-align: center;
`;

type Props = {
  actions :{
    getAllOrganizations :RequestSequence;
    goToRoute :GoToRoute;
    resetRequestState :(actionType :string) => void;
  };
  orgs :Map;
  requestStates :{
    GET_ALL_ORGANIZATIONS :RequestState;
  };
};

class OrgsContainer extends Component<Props> {

  componentDidMount() {
    const { actions } = this.props;
    actions.getAllOrganizations();
  }

  componentDidUpdate(props :Props) {

    const { actions, requestStates } = this.props;
    if (requestStates[GET_ALL_ORGANIZATIONS] === RequestStates.SUCCESS
        && props.requestStates[GET_ALL_ORGANIZATIONS] === RequestStates.PENDING) {
      actions.resetRequestState(OrganizationsApiActions.GET_ALL_ORGANIZATIONS);
    }
  }

  componentWillUnmount() {

    const { actions } = this.props;
    actions.resetRequestState(OrganizationsApiActions.GET_ALL_ORGANIZATIONS);
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

    const { orgs, requestStates } = this.props;

    if (requestStates[GET_ALL_ORGANIZATIONS] === RequestStates.PENDING) {
      return (
        <Spinner size="2x" />
      );
    }

    if (requestStates[GET_ALL_ORGANIZATIONS] === RequestStates.FAILURE) {
      return (
        <Error>
          Sorry, something went wrong. Please try refreshing the page, or contact support.
        </Error>
      );
    }

    const orgCards = orgs.valueSeq().map(org => this.renderOrgCard(org));

    return (
      <>
        <Title>Organizations</Title>
        {
          orgCards.isEmpty()
            ? (
              <Error>
                Sorry, no organizations were found. Please try refreshing the page, or contact support.
              </Error>
            )
            : (
              <CardGrid>
                {orgCards}
              </CardGrid>
            )
        }
      </>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => ({
  orgs: state.getIn(['orgs', 'orgs']),
  requestStates: {
    [GET_ALL_ORGANIZATIONS]: state.getIn(['orgs', GET_ALL_ORGANIZATIONS, 'requestState']),
  }
});

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    getAllOrganizations: OrganizationsApiActions.getAllOrganizations,
    goToRoute: RoutingActions.goToRoute,
    resetRequestState: ReduxActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgsContainer);
