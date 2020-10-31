/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';
import { List, Map, Set, getIn } from 'immutable';
import { AppContentWrapper, Typography } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { EntitySet, Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  Spinner,
  StackGrid,
} from '../../components';
import { GET_OR_SELECT_DATA_SETS, getOrSelectDataSets } from '../../core/edm/actions';
import { EDM } from '../../core/redux/constants';
import { selectAtlasDataSets, selectEntitySets, selectOrganization } from '../../core/redux/selectors';
import { Routes } from '../../core/router';

const OrgDataSetContainer = ({
  dataSetId,
  organizationId,
} :{|
  dataSetId :UUID;
  organizationId :UUID;
|}) => {

  const dispatch = useDispatch();

  // BUG: this is probably a bug because getOrSelectDataSets could be called in the background
  const getOrSelectDataSetsRS :?RequestState = useRequestState([EDM, GET_OR_SELECT_DATA_SETS]);

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const atlasDataSets :Map<UUID, Map> = useSelector(selectAtlasDataSets([dataSetId]));
  const entitySets :Map<UUID, EntitySet> = useSelector(selectEntitySets([dataSetId]));

  const atlasDataSet :?Map = atlasDataSets.get(dataSetId);
  const entitySet :?EntitySet = entitySets.get(dataSetId);
  const description :string = entitySet?.description || getIn(atlasDataSet, ['table', 'description']);
  const name :string = entitySet?.name || getIn(atlasDataSet, ['table', 'name']);
  const title :string = entitySet?.title || getIn(atlasDataSet, ['table', 'title']);
  const contacts :string[] = entitySet?.contacts || [];

  useEffect(() => {
    dispatch(
      getOrSelectDataSets({
        organizationId,
        atlasDataSetIds: [dataSetId],
        entitySetIds: [dataSetId],
      })
    );
  }, [dispatch, dataSetId, organizationId]);

  const dataSetsPath = useMemo(() => (
    Routes.ORG_DATA_SETS.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  const orgPath = useMemo(() => (
    Routes.ORG.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  if (organization) {
    return (
      <>
        <AppContentWrapper>
          <Crumbs>
            <CrumbLink to={orgPath}>{organization.title || 'Organization'}</CrumbLink>
            <CrumbLink to={dataSetsPath}>Data Sets</CrumbLink>
            <CrumbItem>{dataSetId}</CrumbItem>
          </Crumbs>
          {
            getOrSelectDataSetsRS === RequestStates.PENDING && (
              <Spinner />
            )
          }
          {
            getOrSelectDataSetsRS === RequestStates.SUCCESS && (
              <StackGrid gap={48}>
                <StackGrid>
                  <Typography variant="h1">{title || name}</Typography>
                  <Typography>{description || name}</Typography>
                </StackGrid>
                <StackGrid>
                  <Typography variant="h4">Contact</Typography>
                  {
                    contacts.map((contact :string) => (
                      <Typography key={contact}>{contact}</Typography>
                    ))
                  }
                </StackGrid>
              </StackGrid>
            )
          }
        </AppContentWrapper>
      </>
    );
  }

  return null;
};

export default OrgDataSetContainer;
