/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Breadcrumbs,
  Card,
  CardSegment,
  Table,
} from 'lattice-ui-kit';
import { ValidationUtils } from 'lattice-utils';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import type { UUID } from 'lattice';

import * as ReduxActions from '../../core/redux/ReduxActions';
import * as Routes from '../../core/router/Routes';
import * as RoutingActions from '../../core/router/RoutingActions';
import { SectionGrid } from '../../components';
import { getParamFromMatch } from '../../core/router/RouterUtils';
import type { GoToRoot, GoToRoute } from '../../core/router/RoutingActions';

const { isValidUUID } = ValidationUtils;

const CrumbsWrapper = styled.div`
  margin: 20px 0 50px 0;
`;

const CrumbNavLink = styled(NavLink)`
  align-items: center;
  color: #674fef;
  outline: none;
  text-decoration: none;

  &:focus {
    text-decoration: none;
  }

  &:hover {
    cursor: pointer;
    outline: none;
    text-decoration: none;
  }
`;

const TABLE_HEADERS = [
  {
    key: 'columnName',
    label: 'COLUMN NAME',
  },
  {
    key: 'description',
    label: 'DESCRIPTION',
  },
  {
    key: 'datatype',
    label: 'DATA TYPE',
  },
];

const ROWS_PER_PAGE = [20, 50, 100];

type Props = {
  actions :{
    goToRoot :GoToRoot;
    goToRoute :GoToRoute;
  };
  dataSet :Map;
  org :Map;
  requestStates :{
  };
};

class DataSetContainer extends Component<Props> {

  componentDidMount() {

    const {
      actions,
      dataSet,
      org,
    } = this.props;
    const orgId = org.get('id');
    const dataSetId = dataSet.getIn(['table', 'id']);

    if (!isValidUUID(orgId) && !isValidUUID(dataSetId)) {
      actions.goToRoot();
    }
    else if (isValidUUID(orgId) && !isValidUUID(dataSetId)) {
      actions.goToRoute(Routes.ORG.replace(Routes.ID_PARAM, orgId));
    }
  }

  componentDidUpdate() {

  }

  componentWillUnmount() {

  }

  render() {

    const { dataSet, org } = this.props;

    const data = dataSet.get('columns', List()).map((column) => ({
      columnName: column.get('name'),
      datatype: column.get('datatype'),
      description: column.get('description'),
      id: column.get('id'),
    }));

    return (
      <>
        <CrumbsWrapper>
          <Breadcrumbs>
            <CrumbNavLink to={Routes.ORG.replace(Routes.ID_PARAM, org.get('id'))}>{org.get('title')}</CrumbNavLink>
            <div>{dataSet.getIn(['table', 'title'])}</div>
          </Breadcrumbs>
        </CrumbsWrapper>
        <Card>
          <CardSegment noBleed vertical>
            <SectionGrid>
              <h2>Description</h2>
              <h4>{dataSet.getIn(['table', 'description'])}</h4>
            </SectionGrid>
          </CardSegment>
          <CardSegment noBleed vertical>
            <Table
                data={data}
                headers={TABLE_HEADERS}
                paginated
                rowsPerPageOptions={ROWS_PER_PAGE}
                totalRows={data.count()} />
          </CardSegment>
        </Card>
      </>
    );
  }
}

const mapStateToProps = (state :Map, props) => {

  const orgId :?UUID = getParamFromMatch(props.match, Routes.ORG_ID_PARAM);
  const dataSetId :?UUID = getParamFromMatch(props.match, Routes.DATA_SET_ID_PARAM);

  let dataSet;
  const entitySets :List = state.getIn(['edm', 'entitySets']);
  const entitySetsIndexMap :Map = state.getIn(['edm', 'entitySetsIndexMap']);
  const orgDataSets :List = state.getIn(['orgs', 'orgDataSets', orgId], List());
  if (entitySetsIndexMap.has(dataSetId)) {
    dataSet = entitySets.get(entitySetsIndexMap.get(dataSetId));
  }
  else {
    dataSet = orgDataSets.find((orgDataSet) => orgDataSet.getIn(['table', 'id']) === dataSetId);
  }
  if (!dataSet) {
    dataSet = Map();
  }

  return {
    dataSet,
    isOwner: state.hasIn(['orgs', 'isOwnerOfOrgIds', orgId], false),
    org: state.getIn(['orgs', 'orgs', orgId], Map()),
    requestStates: {
    },
  };
};

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    goToRoot: RoutingActions.goToRoot,
    goToRoute: RoutingActions.goToRoute,
    resetRequestState: ReduxActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(DataSetContainer);
