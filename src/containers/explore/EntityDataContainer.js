/*
 * @flow
 */

import React, { useEffect } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { AppContentWrapper, Typography } from 'lattice-ui-kit';
import {
  DataUtils,
  ReduxUtils,
  useRequestState
} from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { FQN, Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import EntityNeighborsContainer from './EntityNeighborsContainer';
import {
  EXPLORE_ENTITY_DATA,
  exploreEntityData,
  exploreEntityNeighbors
} from './actions';
import { EntityDataGrid } from './components';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  LinkButton,
  Spinner
} from '../../components';
import { FQNS } from '../../core/edm/constants';
import { EXPLORE } from '../../core/redux/constants';
import {
  selectEntityNeighborsMap,
  selectOrgDataSet,
  selectOrganization,
  selectSelectedEntityData
} from '../../core/redux/selectors';
import { Routes } from '../../core/router';
import { clipboardWriteText } from '../../utils';

const { getPropertyValue } = DataUtils;
const { isPending } = ReduxUtils;

const FlexContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
`;

const EntityDataContainer = ({
  dataSetDataRoute,
  dataSetId,
  entityKeyId,
  isModal = false,
  organizationId,
  organizationRoute,
} :{|
  dataSetDataRoute ?:string;
  dataSetId :UUID;
  entityKeyId :UUID;
  isModal ?:boolean;
  organizationId :UUID;
  organizationRoute ?:string;
|}) => {
  const dispatch = useDispatch();

  const linkString = `https://openlattice.com/orgs/#${
    Routes.ENTITY_DETAILS
      .replace(Routes.DATA_SET_ID_PARAM, dataSetId)
      .replace(Routes.ENTITY_KEY_ID_PARAM, entityKeyId)
      .replace(Routes.ORG_ID_PARAM, organizationId)
  }`;

  const exploreEntityDataRS :?RequestState = useRequestState([EXPLORE, EXPLORE_ENTITY_DATA]);
  const dataSet :Map<FQN, List> = useSelector(selectOrgDataSet(organizationId, dataSetId));
  const entityData :Map = useSelector(selectSelectedEntityData());
  const neighbors :Map = useSelector(selectEntityNeighborsMap(entityKeyId));
  const organization :?Organization = useSelector(selectOrganization(organizationId));

  const name :string = getPropertyValue(dataSet, [FQNS.OL_DATA_SET_NAME, 0]);
  const title :string = getPropertyValue(dataSet, [FQNS.OL_TITLE, 0]);

  useEffect(() => {
    dispatch(exploreEntityData({ entityKeyId, entitySetId: dataSetId }));
    dispatch(exploreEntityNeighbors({ entityKeyId, entitySetId: dataSetId }));
  }, [dispatch, entityKeyId, dataSetId]);

  if (isPending(exploreEntityDataRS)) {
    return (
      <Spinner />
    );
  }

  if (entityData && dataSetId && organizationId) {
    return (
      <>
        <AppContentWrapper bgColor="white">
          {
            organization && dataSet && !isModal && (
              <Crumbs>
                <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
                <CrumbLink to={dataSetDataRoute}>{title || name}</CrumbLink>
                <CrumbItem>{entityKeyId}</CrumbItem>
              </Crumbs>
            )
          }
          <FlexContainer>
            <Typography gutterBottom variant="h1">{entityKeyId}</Typography>
            <LinkButton
                color="default"
                onClick={() => clipboardWriteText(linkString)}>
              Get Link
            </LinkButton>
          </FlexContainer>
          <EntityDataGrid data={entityData} dataSetId={dataSetId} organizationId={organizationId} />
        </AppContentWrapper>
        <AppContentWrapper>
          <Typography gutterBottom variant="h2">Explore</Typography>
          <EntityNeighborsContainer
              isModal={isModal}
              neighbors={neighbors}
              organizationId={organizationId} />
        </AppContentWrapper>
      </>
    );
  }
  return null;
};

EntityDataContainer.defaultProps = {
  organizationRoute: '',
  dataSetDataRoute: '',
  isModal: false
};

export default EntityDataContainer;
