/*
 * @flow
 */

import React, { useEffect } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { AppContentWrapper, Spinner, Typography } from 'lattice-ui-kit';
import {
  ReduxUtils,
  RoutingUtils,
  ValidationUtils,
  useRequestState
} from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import EntityNeighborsContainer from './EntityNeighborsContainer';
import {
  EXPLORE_ENTITY_DATA,
  exploreEntityData,
  exploreEntityNeighbors
} from './actions';

import { EntityDataGrid, LinkButton } from '../../components';
import {
  ENTITY_NEIGHBORS_MAP,
  EXPLORE,
  SELECTED_ENTITY_DATA
} from '../../core/redux/constants';
import { Routes } from '../../core/router';
import { clipboardWriteText } from '../../utils';

const { isPending } = ReduxUtils;
const { getParamFromMatch } = RoutingUtils;
const { isValidUUID } = ValidationUtils;

const FlexContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
`;

type Props = {
  dataSetId :?UUID;
  entityKeyId :?UUID;
  organizationId :?UUID;
};

const EntityDataContainer = ({
  dataSetId,
  entityKeyId,
  organizationId
} :Props) => {
  const dispatch = useDispatch();

  let usableDataSetId = dataSetId;
  let usableEntityKeyId = entityKeyId;
  let usableOrganizationId = organizationId;
  let linkString :string = '';

  const matchOrganizationDataSetData = useRouteMatch(Routes.ENTITY_DETAILS);
  if (matchOrganizationDataSetData) {
    usableDataSetId = getParamFromMatch(matchOrganizationDataSetData, Routes.DATA_SET_ID_PARAM);
    usableEntityKeyId = getParamFromMatch(matchOrganizationDataSetData, Routes.ENTITY_KEY_ID_PARAM);
    usableOrganizationId = getParamFromMatch(matchOrganizationDataSetData, Routes.ORG_ID_PARAM);
  }

  if (usableDataSetId && usableEntityKeyId && usableOrganizationId) {
    linkString = `https://openlattice.com/orgs/#${Routes.ENTITY_DETAILS
      .replace(Routes.DATA_SET_ID_PARAM, usableDataSetId)
      .replace(Routes.ENTITY_KEY_ID_PARAM, usableEntityKeyId)
      .replace(Routes.ORG_ID_PARAM, usableOrganizationId)}`;
  }

  const neighbors :?Map = useSelector((s) => s.getIn([EXPLORE, ENTITY_NEIGHBORS_MAP, usableEntityKeyId], Map()));
  const entityData :?Map = useSelector((s) => s.getIn([EXPLORE, SELECTED_ENTITY_DATA], Map()));
  const exploreEntityDataRS :?RequestState = useRequestState([EXPLORE, EXPLORE_ENTITY_DATA]);

  useEffect(() => {
    if (isValidUUID(usableEntityKeyId) && isValidUUID(usableDataSetId)) {
      dispatch(exploreEntityData({ entityKeyId: usableEntityKeyId, entitySetId: usableDataSetId }));
      dispatch(exploreEntityNeighbors({ entityKeyId: usableEntityKeyId, entitySetId: usableDataSetId }));
    }
  }, [dispatch, usableEntityKeyId, usableDataSetId]);

  if (isPending(exploreEntityDataRS)) {
    return (
      <Spinner size="2x" />
    );
  }

  if (entityData && usableDataSetId && usableOrganizationId) {
    return (
      <>
        <AppContentWrapper bgColor="white">
          <FlexContainer>
            <Typography gutterBottom variant="h1">{usableEntityKeyId}</Typography>
            <LinkButton
                color="default"
                isDisabled={!linkString.length}
                onClick={() => clipboardWriteText(linkString)}>
              Get Link
            </LinkButton>
          </FlexContainer>
          <EntityDataGrid data={entityData} dataSetId={usableDataSetId} organizationId={usableOrganizationId} />
        </AppContentWrapper>
        <AppContentWrapper>
          <Typography gutterBottom variant="h2">Explore</Typography>
          <EntityNeighborsContainer
              neighbors={neighbors}
              organizationId={usableOrganizationId} />
        </AppContentWrapper>
      </>
    );
  }
  return null;
};

export default EntityDataContainer;
