/*
 * @flow
 */

import React, { useEffect } from 'react';

import { Map, getIn } from 'immutable';
import { AppContentWrapper, AppNavigationWrapper, Typography } from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';
import type {
  EntitySet,
  Organization,
  UUID,
} from 'lattice';
import type { RequestState } from 'redux-reqseq';

import DataSetActionButton from './components/dataset/DataSetActionButton';
import DataSetDataContainer from './DataSetDataContainer';
import DataSetMetaContainer from './DataSetMetaContainer';
import { getShiproomMetadata } from './actions';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  NavContentWrapper,
  SpaceBetweenGrid,
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

const { isPending, isSuccess } = ReduxUtils;

const OrgDataSetContainer = ({
  dataSetDataRoute,
  dataSetId,
  dataSetRoute,
  dataSetsRoute,
  organizationId,
  organizationRoute,
} :{|
  dataSetDataRoute :string;
  dataSetId :UUID;
  dataSetRoute :string;
  dataSetsRoute :string;
  organizationId :UUID;
  organizationRoute :string;
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

  useEffect(() => {
    dispatch(getShiproomMetadata({ dataSetId, organizationId }));
  }, [dispatch, dataSetId, organizationId]);

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
            <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
            <CrumbLink to={dataSetsRoute}>Data Sets</CrumbLink>
            <CrumbItem>{title || name}</CrumbItem>
          </Crumbs>
          {
            isPending(getOrSelectDataSetRS) && (
              <Spinner />
            )
          }
          {
            isSuccess(getOrSelectDataSetRS) && (
              <StackGrid gap={48}>
                <StackGrid>
                  <SpaceBetweenGrid>
                    <Typography variant="h1">{title || name}</Typography>
                    <DataSetActionButton
                        dataSet={atlasDataSet || entitySet}
                        isAtlas={!!atlasDataSet}
                        organizationId={organizationId} />
                  </SpaceBetweenGrid>
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
          isSuccess(getOrSelectDataSetRS) && (
            <>
              <NavContentWrapper bgColor="white">
                <AppNavigationWrapper borderless>
                  <NavLink exact strict to={dataSetRoute}>About</NavLink>
                  {
                    entitySet && (
                      <NavLink to={dataSetDataRoute}>Data</NavLink>
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
