/*
 * @flow
 */

import React, { Component } from 'react';
import type { Element } from 'react';

import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/pro-solid-svg-icons';
import { List, Map, Set } from 'immutable';
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

import { isNonEmptyString } from '../../utils/LangUtils';
import * as OrgsActions from './OrgsActions';
import * as Routes from '../../core/router/Routes';
import * as ReduxActions from '../../core/redux/ReduxActions';
import * as RoutingActions from '../../core/router/RoutingActions';
import type { GoToRoute } from '../../core/router/RoutingActions';

// const LOG = new Logger('OrgsContainer');

const { NEUTRALS } = Colors;
const { GET_ORGS_AND_PERMISSIONS } = OrgsActions;

const Title = styled.h1`
  font-size: 28px;
  font-weight: normal;
  margin: 20px 0 0 0;
  padding: 0;
`;

const OrgCount = styled.span`
  color: #674fef;
  font-weight: normal;
`;

const OrgCollectionSection = styled.section`
  > h2 {
    font-size: 22px;
    font-weight: 500;
    margin: 48px 0 24px 0;
  }

  ${OrgCount} {
    margin: 0 0 0 8px;
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-gap: 30px;
  grid-template-columns: 1fr 1fr; /* the goal is to have 2 equal-width columns */

  ${Card} {
    min-width: 0; /* setting min-width ensures cards do not overflow the grid column */
  }
`;

const OrgName = styled.h2`
  font-size: 18px;
  font-weight: normal;
  margin: 0;
  padding: 0;
`;

const OrgSegment = styled.div`
  display: grid;
  grid-auto-rows: min-content;
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
  overflow: hidden;
  overflow-wrap: break-word;
  padding: 0;
  text-overflow: ellipsis;
`;

const Error = styled.div`
  text-align: center;
`;

type Props = {
  actions :{
    getOrgsAndPermissions :RequestSequence;
    goToRoute :GoToRoute;
    resetRequestState :(actionType :string) => void;
  };
  isMemberOfOrgIds :Set<UUID>;
  isOwnerOfOrgIds :Set<UUID>;
  orgs :Map<UUID, Map>;
  requestStates :{
    GET_ORGS_AND_PERMISSIONS :RequestState;
  };
};

class OrgsContainer extends Component<Props> {

  componentDidMount() {
    const { actions } = this.props;
    actions.getOrgsAndPermissions();
  }

  componentDidUpdate(props :Props) {

    const { actions, requestStates } = this.props;
    if (requestStates[GET_ORGS_AND_PERMISSIONS] === RequestStates.SUCCESS
        && props.requestStates[GET_ORGS_AND_PERMISSIONS] === RequestStates.PENDING) {
      actions.resetRequestState(OrgsActions.GET_ORGS_AND_PERMISSIONS);
    }
  }

  componentWillUnmount() {

    const { actions } = this.props;
    actions.resetRequestState(OrgsActions.GET_ORGS_AND_PERMISSIONS);
  }

  goToOrg = (org :Map) => {
    const { actions } = this.props;
    const orgId :UUID = org.get('id');
    actions.goToRoute(Routes.ORG.replace(Routes.ID_PATH, orgId));
  }

  renderOrgCard = (org :Map) => {

    let description :string = org.get('description', '');

    // TODO: refactor as a utility function
    if (description.length > 100) {
      let spaceIndex = description.indexOf(' ', 98);
      if (spaceIndex === -1) spaceIndex = 100;
      description = `${description.substr(0, spaceIndex)}...`;
    }

    return (
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
            {
              isNonEmptyString(description) && (
                <OrgDescription>{description}</OrgDescription>
              )
            }
          </OrgSegment>
        </CardSegment>
      </Card>
    );
  }

  renderOrgCollectionSection = (title :string, orgCards :Element<any>[]) => {

    if (orgCards.length === 0) {
      return null;
    }

    return (
      <OrgCollectionSection>
        <h2>
          <span>{title}</span>
          <OrgCount>{orgCards.length}</OrgCount>
        </h2>
        <CardGrid>{orgCards}</CardGrid>
      </OrgCollectionSection>
    );
  }

  render() {

    const {
      isMemberOfOrgIds,
      isOwnerOfOrgIds,
      orgs,
      requestStates,
    } = this.props;

    if (requestStates[GET_ORGS_AND_PERMISSIONS] === RequestStates.PENDING) {
      return (
        <Spinner size="2x" />
      );
    }

    if (requestStates[GET_ORGS_AND_PERMISSIONS] === RequestStates.FAILURE) {
      return (
        <Error>
          Sorry, something went wrong. Please try refreshing the page, or contact support.
        </Error>
      );
    }

    const ownerOrgCards :Element<any>[] = [];
    const memberOrgCards :Element<any>[] = [];
    const publicOrgCards :Element<any>[] = [];

    orgs.forEach((org :Map, orgId :UUID) => {
      const orgCard :Element<any> = this.renderOrgCard(org);
      if (isOwnerOfOrgIds.has(orgId)) {
        ownerOrgCards.push(orgCard);
      }
      else if (isMemberOfOrgIds.has(orgId)) {
        memberOrgCards.push(orgCard);
      }
      else {
        publicOrgCards.push(orgCard);
      }
    });

    return (
      <>
        <Title>Organizations</Title>
        {
          orgs.isEmpty() && (
            <Error>
              Sorry, no organizations were found. Please try refreshing the page, or contact support.
            </Error>
          )
        }
        {this.renderOrgCollectionSection('Owner', ownerOrgCards)}
        {this.renderOrgCollectionSection('Member', memberOrgCards)}
        {this.renderOrgCollectionSection('Public', publicOrgCards)}
      </>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => ({
  isMemberOfOrgIds: state.getIn(['orgs', 'isMemberOfOrgIds'], Set()),
  isOwnerOfOrgIds: state.getIn(['orgs', 'isOwnerOfOrgIds'], Set()),
  orgs: state.getIn(['orgs', 'orgs']),
  requestStates: {
    [GET_ORGS_AND_PERMISSIONS]: state.getIn(['orgs', GET_ORGS_AND_PERMISSIONS, 'requestState']),
  }
});

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    getOrgsAndPermissions: OrgsActions.getOrgsAndPermissions,
    goToRoute: RoutingActions.goToRoute,
    resetRequestState: ReduxActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgsContainer);
