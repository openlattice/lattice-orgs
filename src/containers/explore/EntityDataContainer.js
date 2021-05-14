/*
 * @flow
 */

import React, { useEffect } from 'react';

import styled from 'styled-components';
import { Map, List } from 'immutable';
import { AppContentWrapper, AppNavigationWrapper } from 'lattice-ui-kit';
import { RoutingUtils, ValidationUtils } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router';
import { NavLink } from 'react-router-dom';
import type { FQN, UUID } from 'lattice';

import EntityNeighborsContainer from './EntityNeighborsContainer';

import { EntityDataGrid } from '../../components';
import { exploreEntityData, exploreEntityNeighbors } from './actions';
import { selectOrgDataSetColumns } from '../../core/redux/selectors';
import {
  ENTITY_NEIGHBORS_MAP,
  EXPLORE,
  SELECTED_ENTITY_DATA
} from '../../core/redux/constants';
import { Routes } from '../../core/router';

const { getParamFromMatch } = RoutingUtils;
const { isValidUUID } = ValidationUtils;

const NavContentWrapper = styled(AppContentWrapper)`
  > div {
    padding: 0;
  }
`;

type Props = {
  dataSetId :UUID;
  organizationId :UUID;
};

const EntityDataContainer = ({
  dataSetId,
  organizationId
} :Props) => {
  const dispatch = useDispatch();

  let entityKeyId :?UUID;

  const matchOrganizationDataSetData = useRouteMatch(Routes.ENTITY_DETAILS);
  if (matchOrganizationDataSetData) {
    entityKeyId = getParamFromMatch(matchOrganizationDataSetData, Routes.ENTITY_KEY_ID_PARAM);
  }
  const dataSetColumns :List<Map<FQN, List>> = useSelector(selectOrgDataSetColumns(organizationId, dataSetId));
  const neighbors :?Map = useSelector((s) => s.getIn([EXPLORE, ENTITY_NEIGHBORS_MAP, entityKeyId], Map()));
  const entityData :?Map = useSelector((s) => s.getIn([EXPLORE, SELECTED_ENTITY_DATA], Map()));

  useEffect(() => {
    if (isValidUUID(entityKeyId) && isValidUUID(dataSetId)) {
      dispatch(exploreEntityData({ entityKeyId, entitySetId: dataSetId }));
      dispatch(exploreEntityNeighbors({ entityKeyId, entitySetId: dataSetId }));
    }
  }, [dispatch, entityKeyId, dataSetId]);

  if (entityData && dataSetId) {
    return (
      <>
        <AppContentWrapper bgColor="white">
          <EntityDataGrid data={entityData} dataSetColumns={dataSetColumns} />
        </AppContentWrapper>
        <NavContentWrapper bgColor="white">
          <AppNavigationWrapper borderless>
            <NavLink to="#">Associated Data</NavLink>
          </AppNavigationWrapper>
        </NavContentWrapper>
        <AppContentWrapper>
          <EntityNeighborsContainer
              neighbors={neighbors}
              organizationId={organizationId} />
        </AppContentWrapper>
      </>
    );
  }
  return null;
};

export default EntityDataContainer;
