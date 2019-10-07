/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { faListAlt } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import { Types } from 'lattice';
import { OrganizationsApiActions } from 'lattice-sagas';
import {
  Card,
  CardSegment,
  Colors,
  Spinner,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { Match } from 'react-router';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import * as ReduxActions from '../../core/redux/ReduxActions';
import * as RoutingActions from '../../core/router/RoutingActions';
import { isValidUUID } from '../../utils/ValidationUtils';
import type { GoToRoot } from '../../core/router/RoutingActions';

const { NEUTRALS } = Colors;
const { EntitySetFlagTypes } = Types;

const {
  GET_ORGANIZATION_ENTITY_SETS,
} = OrganizationsApiActions;

const SUB_TITLE = `
These entity sets belong to this organization, and can be materialized by anyone with materialize permissions.
`;

const H3 = styled.h3`
  font-size: 22px;
  font-weight: 600;
  margin: 0;
`;


const CardGrid = styled.div`
  display: grid;
  grid-column-gap: 30px;
  grid-row-gap: 16px;
  grid-template-columns: 1fr 1fr; /* the goal is to have 2 equal-width columns */

  ${Card} {
    min-width: 0; /* setting min-width ensures cards do not overflow the grid column */
  }
`;

const IconWrapper = styled.div`
  align-items: center;
  background-color: ${NEUTRALS[8]};
  border-right: 1px solid ${NEUTRALS[4]};
  display: flex;
  flex: 0 0 auto;
  font-size: 17px;
  justify-content: center;
  min-height: 88px;
  width: 65px
`;

const EntitySetInfoWrapper = styled.div`
  padding: 10px;

  > h4 {
    color: ${NEUTRALS[0]};
    font-size: 16px;
    font-weight: normal;
    margin: 0 0 8px 0;
  }

  > span {
    color: ${NEUTRALS[1]};
    font-size: 14px;
    font-weight: normal;
    margin: 0;
  }
`;

const Error = styled.div`
  text-align: center;
`;

type Props = {
  actions :{
    getOrganizationEntitySets :RequestSequence;
    goToRoot :GoToRoot;
    resetRequestState :(actionType :string) => void;
  };
  entitySets :List;
  entitySetsIndexMap :Map;
  match :Match;
  orgEntitySets :Map;
  requestStates :{
    GET_ORGANIZATION_ENTITY_SETS :RequestState;
  };
};

type State = {
  showAssociationEntitySets :boolean;
  showAuditEntitySets :boolean;
};

class OrgEntitySetsContainer extends Component<Props, State> {

  constructor(props :Props) {

    super(props);
    this.state = {
      showAssociationEntitySets: false,
      showAuditEntitySets: false,
    };
  }

  componentDidMount() {

    const { actions, match } = this.props;
    const { params: { id: orgId = null } = {} } = match;

    if (!isValidUUID(orgId)) {
      actions.goToRoot();
    }
    else {
      actions.getOrganizationEntitySets(orgId);
    }
  }

  componentDidUpdate(prevProps :Props) {

    const { actions, match } = this.props;
    const { params: { id: orgId = null } = {} } = match;
    const { params: { id: prevOrgId = null } = {} } = prevProps.match;

    if (orgId !== prevOrgId) {
      actions.getOrganizationEntitySets(orgId);
    }
  }

  // componentWillUnmount() {
  //
  // }

  render() {

    const { orgEntitySets, requestStates } = this.props;
    const { showAssociationEntitySets, showAuditEntitySets } = this.state;

    if (requestStates[GET_ORGANIZATION_ENTITY_SETS] === RequestStates.PENDING) {
      return (
        <Spinner size="2x" />
      );
    }

    if (requestStates[GET_ORGANIZATION_ENTITY_SETS] === RequestStates.FAILURE) {
      return (
        <Error>
          Sorry, something went wrong. Please try refreshing the page, or contact support.
        </Error>
      );
    }

    return (
      <Card>
        <CardSegment noBleed vertical>
          <H3>Entity Sets</H3>
          <p>{SUB_TITLE}</p>
        </CardSegment>
        <CardSegment vertical>
          <CardGrid>
            {
              orgEntitySets.keySeq().map((entitySetId :UUID) => {
                const { entitySets, entitySetsIndexMap } = this.props;
                const entitySetIndex = entitySetsIndexMap.get(entitySetId);
                const entitySet = entitySets.get(entitySetIndex, Map());
                const entitySetFlags = entitySet.get('flags', List());
                if (!showAuditEntitySets && entitySetFlags.includes(EntitySetFlagTypes.AUDIT)) {
                  return null;
                }
                if (!showAssociationEntitySets && entitySetFlags.includes(EntitySetFlagTypes.ASSOCIATION)) {
                  return null;
                }
                return (
                  <Card key={entitySetId}>
                    <CardSegment padding="0">
                      <IconWrapper>
                        <FontAwesomeIcon icon={faListAlt} />
                      </IconWrapper>
                      <EntitySetInfoWrapper>
                        <h4>{entitySet.get('title', entitySetId)}</h4>
                        <span>{entitySet.get('name', '')}</span>
                      </EntitySetInfoWrapper>
                    </CardSegment>
                  </Card>
                );
              })
            }
          </CardGrid>
        </CardSegment>
      </Card>
    );
  }
}

const mapStateToProps = (state :Map, props :Object) => {

  const {
    params: {
      id: orgId = null,
    } = {},
  } = props.match;

  return {
    entitySets: state.getIn(['edm', 'entitySets'], List()),
    entitySetsIndexMap: state.getIn(['edm', 'entitySetsIndexMap'], Map()),
    isOwner: state.hasIn(['orgs', 'isOwnerOfOrgIds', orgId], false),
    org: state.getIn(['orgs', 'orgs', orgId], Map()),
    orgEntitySets: state.getIn(['orgs', 'orgEntitySets', orgId], Map()),
    requestStates: {
      [GET_ORGANIZATION_ENTITY_SETS]: state.getIn(['orgs', GET_ORGANIZATION_ENTITY_SETS, 'requestState']),
    },
  };
};

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    getOrganizationEntitySets: OrganizationsApiActions.getOrganizationEntitySets,
    goToRoot: RoutingActions.goToRoot,
    resetRequestState: ReduxActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgEntitySetsContainer);
