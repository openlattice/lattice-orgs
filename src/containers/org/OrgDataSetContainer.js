/*
 * @flow
 */

import React, { useEffect, useMemo } from 'react';

import { Map, getIn } from 'immutable';
import { AppContentWrapper, AppNavigationWrapper, Typography } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';
import { RequestStates } from 'redux-reqseq';
import type {
  EntitySet,
  Organization,
  UUID,
} from 'lattice';
import type { RequestState } from 'redux-reqseq';

import DataSetDataContainer from './DataSetDataContainer';
import DataSetMetaContainer from './DataSetMetaContainer';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  NavContentWrapper,
  Spinner,
  StackGrid,
} from '../../components';
import { GET_OR_SELECT_DATA_SET, getOrSelectDataSet } from '../../core/edm/actions';
import { EDM } from '../../core/redux/constants';
import {
  selectAtlasDataSets,
  selectEntitySets,
  selectOrganization,
} from '../../core/redux/selectors';
import { Routes } from '../../core/router';

const OrgDataSetContainer = ({
  dataSetId,
  organizationId,
} :{|
  dataSetId :UUID;
  organizationId :UUID;
|}) => {

  const dispatch = useDispatch();

  const getOrSelectDataSetRS :?RequestState = useRequestState([EDM, GET_OR_SELECT_DATA_SET]);

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
    dispatch(getOrSelectDataSet({ dataSetId, organizationId }));
  }, [dispatch, dataSetId, organizationId]);

  const orgPath = useMemo(() => (
    Routes.ORG.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  const dataSetsPath = useMemo(() => (
    Routes.ORG_DATA_SETS.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  const dataSetPath = useMemo(() => (
    Routes.ORG_DATA_SET
      .replace(Routes.ORG_ID_PARAM, organizationId)
      .replace(Routes.DATA_SET_ID_PARAM, dataSetId)
  ), [dataSetId, organizationId]);

  const dataSetDataPath = useMemo(() => (
    Routes.ORG_DATA_SET_DATA
      .replace(Routes.ORG_ID_PARAM, organizationId)
      .replace(Routes.DATA_SET_ID_PARAM, dataSetId)
  ), [dataSetId, organizationId]);

  if (organization) {

    const renderDataSetDataContainer = () => (
      <DataSetDataContainer atlasDataSet={atlasDataSet} dataSetId={dataSetId} entitySet={entitySet} />
    );

    const renderDataSetMetaContainer = () => (
      <DataSetMetaContainer atlasDataSet={atlasDataSet} dataSetId={dataSetId} entitySet={entitySet} />
    );

    return (
      <>
        <AppContentWrapper>
          <Crumbs>
            <CrumbLink to={orgPath}>{organization.title || 'Organization'}</CrumbLink>
            <CrumbLink to={dataSetsPath}>Data Sets</CrumbLink>
            <CrumbItem>{title || name}</CrumbItem>
          </Crumbs>
          {
            getOrSelectDataSetRS === RequestStates.PENDING && (
              <Spinner />
            )
          }
          {
            getOrSelectDataSetRS === RequestStates.SUCCESS && (
              <StackGrid gap={48}>
                <StackGrid>
                  <Typography variant="h1">{title || name}</Typography>
                  <Typography>{description || name}</Typography>
                </StackGrid>
                <StackGrid>
                  <Typography variant="h4">Contact</Typography>
                  {
                    contacts.length === 0 && (
                      <Typography>No contact information is available.</Typography>
                    )
                  }
                  {
                    contacts.length > 0 && (
                      contacts.map((contact :string) => (
                        <Typography key={contact}>{contact}</Typography>
                      ))
                    )
                  }
                </StackGrid>
              </StackGrid>
            )
          }
        </AppContentWrapper>
        {
          getOrSelectDataSetRS === RequestStates.SUCCESS && (
            <>
              <NavContentWrapper bgColor="white">
                <AppNavigationWrapper borderless>
                  <NavLink exact strict to={dataSetPath}>About</NavLink>
                  {
                    entitySet && (
                      <NavLink to={dataSetDataPath}>Data</NavLink>
                    )
                  }
                </AppNavigationWrapper>
              </NavContentWrapper>
              <Switch>
                <Route exact path={Routes.ORG_DATA_SET_DATA} render={renderDataSetDataContainer} />
                <Route exact path={Routes.ORG_DATA_SET} render={renderDataSetMetaContainer} />
              </Switch>
            </>
          )
        }
      </>
    );
  }

  return null;
};

export default OrgDataSetContainer;
