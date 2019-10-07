/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { faListAlt } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import {
  Card,
  CardSegment,
  CheckboxSelect,
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

const { NEUTRALS, PURPLES } = Colors;

const {
  GET_ORGANIZATION_ENTITY_SETS,
} = OrganizationsApiActions;

const SUB_TITLE = `
These entity sets belong to this organization, and can be materialized by anyone with materialize permissions.
`;

const AUDIT_OPTION = { label: 'Audit', value: 'AUDIT' };
const EXTERNAL_OPTION = { label: 'External', value: 'EXTERNAL' };
const INTERNAL_OPTION = { label: 'Internal', value: 'INTERNAL' };
const MATERIALIZED_OPTION = { label: 'Materialized', value: 'MATERIALIZED' };

const ES_SELECT_OPTIONS = [
  INTERNAL_OPTION,
  EXTERNAL_OPTION,
  MATERIALIZED_OPTION,
  AUDIT_OPTION,
];

const EntitySetTitle = styled.h3`
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 16px 0;
`;

const EntitySetSubTitle = styled.p`
  margin: 0;
`;

const EntitySetType = styled.h3`
  color: ${({ isActive }) => (isActive ? PURPLES[1] : NEUTRALS[1])};
  cursor: pointer;
  flex: 1 0 auto;
  font-size: 18px;
  font-weight: normal;
  margin: 20px 30px 20px 0;

  &:hover {
    color: ${({ isActive }) => (isActive ? PURPLES[1] : NEUTRALS[0])};
  }
`;

const EntitySetSelectionWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 30px;
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
  padding: 16px;

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
  entitySetFilters :Object[];
  showAssociationEntitySets :boolean;
};

class OrgEntitySetsContainer extends Component<Props, State> {

  constructor(props :Props) {

    super(props);
    this.state = {
      entitySetFilters: [INTERNAL_OPTION],
      showAssociationEntitySets: false,
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

  handleOnChangeSelect = (options :?Object[]) => {

    this.setState({ entitySetFilters: options || [] });
  }

  selectAssociationEntitySets = () => {

    this.setState({ showAssociationEntitySets: true });
  }

  selectRegularEntitySets = () => {

    this.setState({ showAssociationEntitySets: false });
  }

  filterEntitySets = () => {

    const { orgEntitySets } = this.props;
    const { entitySetFilters, showAssociationEntitySets } = this.state;

    return orgEntitySets
      .keySeq()
      .map((entitySetId :UUID) => {
        const { entitySets, entitySetsIndexMap } = this.props;
        const entitySetIndex = entitySetsIndexMap.get(entitySetId);
        return entitySets.get(entitySetIndex, Map());
      })
      .filter((entitySet :Map) => {

        const orgEntitySetFlags :List = orgEntitySets.get(entitySet.get('id'), List());
        const entitySetFlags :List = entitySet.get('flags', List());

        let filtersMatchEntitySet :boolean = false;
        if (orgEntitySetFlags.includes('INTERNAL') && entitySetFilters.includes(INTERNAL_OPTION)) {
          filtersMatchEntitySet = true;
        }
        else if (orgEntitySetFlags.includes('EXTERNAL') && entitySetFilters.includes(EXTERNAL_OPTION)) {
          filtersMatchEntitySet = true;
        }
        else if (orgEntitySetFlags.includes('MATERIALIZED') && entitySetFilters.includes(MATERIALIZED_OPTION)) {
          filtersMatchEntitySet = true;
        }

        const isAuditEntitySet :boolean = entitySetFlags.includes('AUDIT');
        if (isAuditEntitySet && !entitySetFilters.includes(AUDIT_OPTION)) {
          return false;
        }

        const isAssociationEntitySet :boolean = entitySetFlags.includes('ASSOCIATION');
        if (isAssociationEntitySet && showAssociationEntitySets && filtersMatchEntitySet) {
          return true;
        }
        if (!isAssociationEntitySet && !showAssociationEntitySets && filtersMatchEntitySet) {
          return true;
        }

        return false;
      });
  }

  render() {

    const { requestStates } = this.props;
    const { entitySetFilters, showAssociationEntitySets } = this.state;

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

    const filteredEntitySets :List = this.filterEntitySets();

    return (
      <Card>
        <CardSegment noBleed vertical>
          <EntitySetTitle>Entity Sets</EntitySetTitle>
          <EntitySetSubTitle>{SUB_TITLE}</EntitySetSubTitle>
        </CardSegment>
        <CardSegment vertical>
          <EntitySetSelectionWrapper>
            <EntitySetType
                isActive={!showAssociationEntitySets}
                onClick={this.selectRegularEntitySets}>
              Regular Entity Sets
            </EntitySetType>
            <EntitySetType
                isActive={showAssociationEntitySets}
                onClick={this.selectAssociationEntitySets}>
              Association Entity Sets
            </EntitySetType>
            <CheckboxSelect
                defaultValue={entitySetFilters}
                options={ES_SELECT_OPTIONS}
                onChange={this.handleOnChangeSelect} />
          </EntitySetSelectionWrapper>
          <CardGrid>
            {
              filteredEntitySets.map((entitySet :Map) => (
                <Card key={entitySet.get('id')}>
                  <CardSegment padding="0">
                    <IconWrapper>
                      <FontAwesomeIcon icon={faListAlt} />
                    </IconWrapper>
                    <EntitySetInfoWrapper>
                      <h4>{entitySet.get('title', entitySet.get('id'))}</h4>
                      <span>{entitySet.get('name', '')}</span>
                    </EntitySetInfoWrapper>
                  </CardSegment>
                </Card>
              ))
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
