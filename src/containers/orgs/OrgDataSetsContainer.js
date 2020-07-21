/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { faListAlt } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import { Models } from 'lattice';
import { EntitySetsApiActions, OrganizationsApiActions } from 'lattice-sagas';
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
import type { EntitySetFlagType, UUID } from 'lattice';
import type { Match } from 'react-router';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import * as OrgsActions from './OrgsActions';

import * as ReduxActions from '../../core/redux/ReduxActions';
import * as Routes from '../../core/router/Routes';
import * as RoutingActions from '../../core/router/RoutingActions';
import { getIdFromMatch } from '../../core/router/RouterUtils';
import type { GoToRoot, GoToRoute } from '../../core/router/RoutingActions';

const { NEUTRALS, PURPLES } = Colors;
const { EntitySet } = Models;

const { GET_ORGANIZATION_DATA_SETS } = OrgsActions;
const { GET_ALL_ENTITY_SETS } = EntitySetsApiActions;
const { GET_ORGANIZATION_ENTITY_SETS } = OrganizationsApiActions;

// const SUB_TITLE = `
// These entity sets belong to this organization, and can be materialized by anyone with materialize permissions.
// `;

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

const Title = styled.h2`
  font-size: 22px;
  font-weight: 500;
  margin: 0 0 16px 0;
`;

// const SubTitle = styled.p`
//   margin: 0;
// `;

const DataSetType = styled.h3`
  color: ${({ isActive }) => (isActive ? PURPLES[1] : NEUTRALS[1])};
  cursor: pointer;
  flex: 0 0 auto;
  font-size: 18px;
  font-weight: normal;
  margin: 20px 30px 20px 0;

  &:hover {
    color: ${({ isActive }) => (isActive ? PURPLES[1] : NEUTRALS[0])};
  }
`;

const DataSetSelectionWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-start;
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
  width: 65px;
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
    getOrganizationDataSets :RequestSequence;
    getOrganizationEntitySets :RequestSequence;
    goToRoot :GoToRoot;
    goToRoute :GoToRoute;
    resetRequestState :(actionType :string) => void;
  };
  entitySets :List<EntitySet>;
  entitySetsIndexMap :Map;
  match :Match;
  orgDataSets :Map;
  orgEntitySets :Map;
  requestStates :{
    GET_ALL_ENTITY_SETS :RequestState;
    GET_ORGANIZATION_DATA_SETS :RequestState;
    GET_ORGANIZATION_ENTITY_SETS :RequestState;
  };
};

type State = {
  entitySetFilters :Object[];
  showAssociationEntitySets :boolean;
  showStandardizedDataSets :boolean;
};

class OrgDataSetsContainer extends Component<Props, State> {

  constructor(props :Props) {

    super(props);
    this.state = {
      entitySetFilters: [INTERNAL_OPTION],
      showAssociationEntitySets: false,
      showStandardizedDataSets: true,
    };
  }

  componentDidMount() {

    const { actions, match } = this.props;
    const orgId :?UUID = getIdFromMatch(match);
    actions.getOrganizationEntitySets(orgId);
    actions.getOrganizationDataSets(orgId);
  }

  componentDidUpdate(prevProps :Props) {

    const { actions, match } = this.props;
    const orgId :?UUID = getIdFromMatch(match);
    const prevOrgId :?UUID = getIdFromMatch(prevProps.match);

    if (orgId !== prevOrgId) {
      actions.getOrganizationEntitySets(orgId);
    }
  }

  goToDataSet = (event :SyntheticEvent<HTMLElement>) => {

    const { actions, match } = this.props;
    const { currentTarget } = event;
    const { id: dataSetId } = currentTarget;
    const orgId :?UUID = getIdFromMatch(match);
    if (orgId) {
      actions.goToRoute(
        Routes.DATA_SET.replace(Routes.ORG_ID_PARAM, orgId).replace(Routes.DATA_SET_ID_PARAM, dataSetId)
      );
    }
  }

  handleOnChangeSelect = (options :?Object[]) => {

    this.setState({ entitySetFilters: options || [] });
  }

  selectAssociationEntitySets = () => {

    this.setState({ showAssociationEntitySets: true });
  }

  selectRegularEntitySets = () => {

    this.setState({ showAssociationEntitySets: false });
  }

  selectStandardizedDataSets = () => {

    this.setState({ showStandardizedDataSets: true });
  }

  selectUnstandardizedDataSets = () => {

    this.setState({ showStandardizedDataSets: false });
  }

  filterEntitySets = () => {

    const { orgEntitySets } = this.props;
    const { entitySetFilters, showAssociationEntitySets } = this.state;

    return orgEntitySets
      .keySeq()
      .map((entitySetId :UUID) => {
        const { entitySets, entitySetsIndexMap } = this.props;
        const entitySetIndex = entitySetsIndexMap.get(entitySetId);
        return entitySets.get(entitySetIndex);
      })
      .filter((entitySet :EntitySet) => {

        const orgEntitySetFlags :EntitySetFlagType[] = orgEntitySets.get(entitySet.id, []);
        const entitySetFlags :EntitySetFlagType[] = entitySet.flags || [];

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

  renderEntitySetsSegment = () => {

    const { entitySetFilters, showAssociationEntitySets } = this.state;
    const filteredEntitySets :List<EntitySet> = this.filterEntitySets();

    return (
      <>
        <DataSetSelectionWrapper>
          <DataSetType
              isActive={!showAssociationEntitySets}
              onClick={this.selectRegularEntitySets}>
            Regular Entity Sets
          </DataSetType>
          <DataSetType
              isActive={showAssociationEntitySets}
              onClick={this.selectAssociationEntitySets}>
            Association Entity Sets
          </DataSetType>
          <CheckboxSelect
              defaultValue={entitySetFilters}
              options={ES_SELECT_OPTIONS}
              onChange={this.handleOnChangeSelect} />
        </DataSetSelectionWrapper>
        {
          filteredEntitySets.isEmpty() && (
            <p>No EntitySets matching the selected filters.</p>
          )
        }
        <CardGrid>
          {
            filteredEntitySets.map((entitySet :EntitySet) => (
              <Card key={entitySet.id}>
                <CardSegment padding="0">
                  <IconWrapper>
                    <FontAwesomeIcon icon={faListAlt} />
                  </IconWrapper>
                  <EntitySetInfoWrapper>
                    <h4>{entitySet.title || entitySet.id}</h4>
                    <span>{entitySet.name}</span>
                  </EntitySetInfoWrapper>
                </CardSegment>
              </Card>
            ))
          }
        </CardGrid>
      </>
    );
  }

  renderDataSetsSegment = () => {

    const { orgDataSets } = this.props;

    return (
      <>
        {
          orgDataSets.isEmpty() && (
            <p>No data sets.</p>
          )
        }
        <CardGrid>
          {
            orgDataSets.map((dataSet :Map) => {
              const id = dataSet.getIn(['table', 'id']);
              const name = dataSet.getIn(['table', 'name']);
              const title = dataSet.getIn(['table', 'title']);
              return (
                <Card id={id} key={id} onClick={this.goToDataSet}>
                  <CardSegment padding="0">
                    <IconWrapper>
                      <FontAwesomeIcon icon={faListAlt} />
                    </IconWrapper>
                    <EntitySetInfoWrapper>
                      <h4>{title}</h4>
                      <span>{name}</span>
                    </EntitySetInfoWrapper>
                  </CardSegment>
                </Card>
              );
            })
          }
        </CardGrid>
      </>
    );
  }

  render() {

    const { requestStates } = this.props;
    const { showStandardizedDataSets } = this.state;

    const isPending = requestStates[GET_ALL_ENTITY_SETS] === RequestStates.PENDING
      || requestStates[GET_ORGANIZATION_ENTITY_SETS] === RequestStates.PENDING
      || requestStates[GET_ORGANIZATION_DATA_SETS] === RequestStates.PENDING;

    const isSuccess = requestStates[GET_ALL_ENTITY_SETS] === RequestStates.SUCCESS
      && requestStates[GET_ORGANIZATION_ENTITY_SETS] === RequestStates.SUCCESS
      && requestStates[GET_ORGANIZATION_DATA_SETS] === RequestStates.SUCCESS;

    const isFailure = requestStates[GET_ALL_ENTITY_SETS] === RequestStates.FAILURE
      || requestStates[GET_ORGANIZATION_ENTITY_SETS] === RequestStates.FAILURE
      || requestStates[GET_ORGANIZATION_DATA_SETS] === RequestStates.FAILURE;

    return (
      <Card>
        <CardSegment noBleed vertical>
          <Title>Data Sets</Title>
          {
            isPending && (
              <Spinner size="2x" />
            )
          }
          {
            isSuccess && (
              <DataSetSelectionWrapper>
                <DataSetType
                    isActive={showStandardizedDataSets}
                    onClick={this.selectStandardizedDataSets}>
                  Standardized
                </DataSetType>
                <DataSetType
                    isActive={!showStandardizedDataSets}
                    onClick={this.selectUnstandardizedDataSets}>
                  Unstandardized
                </DataSetType>
              </DataSetSelectionWrapper>
            )
          }
          {
            isSuccess && showStandardizedDataSets && this.renderEntitySetsSegment()
          }
          {
            isSuccess && !showStandardizedDataSets && this.renderDataSetsSegment()
          }
        </CardSegment>
        {
          isFailure && (
            <CardSegment>
              <Error>
                Sorry, something went wrong. Please try refreshing the page, or contact support.
              </Error>
            </CardSegment>
          )
        }
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
    orgDataSets: state.getIn(['orgs', 'orgDataSets', orgId], Map()),
    orgEntitySets: state.getIn(['orgs', 'orgEntitySets', orgId], Map()),
    requestStates: {
      [GET_ALL_ENTITY_SETS]: state.getIn(['edm', GET_ALL_ENTITY_SETS, 'requestState']),
      [GET_ORGANIZATION_DATA_SETS]: state.getIn(['orgs', GET_ORGANIZATION_DATA_SETS, 'requestState']),
      [GET_ORGANIZATION_ENTITY_SETS]: state.getIn(['orgs', GET_ORGANIZATION_ENTITY_SETS, 'requestState']),
    },
  };
};

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    getOrganizationDataSets: OrgsActions.getOrganizationDataSets,
    getOrganizationEntitySets: OrganizationsApiActions.getOrganizationEntitySets,
    goToRoot: RoutingActions.goToRoot,
    goToRoute: RoutingActions.goToRoute,
    resetRequestState: ReduxActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(OrgDataSetsContainer);
