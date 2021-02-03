/*
 * @flow
 */

import React, { useEffect, useMemo } from 'react';

import { Map, get } from 'immutable';
import { AppContentWrapper, AppNavigationWrapper, Typography } from 'lattice-ui-kit';
import {
  DataUtils,
  LangUtils,
  ReduxUtils,
  useRequestState,
} from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';
import type { Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import DataSetActionButton from './components/dataset/DataSetActionButton';
import DataSetDataContainer from './DataSetDataContainer';
import DataSetMetaDataContainer from './DataSetMetaDataContainer';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  NavContentWrapper,
  SpaceBetweenGrid,
  Spinner,
  StackGrid,
} from '../../components';
import { GET_DATA_SET_METADATA, getDataSetMetaData } from '../../core/edm/actions';
import { FQNS } from '../../core/edm/constants';
import { getOwnerStatus } from '../../core/permissions/actions';
import { DATA_SET, EDM } from '../../core/redux/constants';
import { selectDataSetMetaData, selectOrganization } from '../../core/redux/selectors';
import { Routes } from '../../core/router';
import { isAtlasDataSet } from '../../utils';

const { getPropertyValue } = DataUtils;
const { isNonEmptyString } = LangUtils;
const { isPending, isSuccess } = ReduxUtils;

const OrgDataSetContainer = ({
  dataSetDataRoute,
  dataSetId,
  dataSetRoute,
  organizationId,
  organizationRoute,
} :{|
  dataSetDataRoute :string;
  dataSetId :UUID;
  dataSetRoute :string;
  organizationId :UUID;
  organizationRoute :string;
|}) => {

  const dispatch = useDispatch();

  const getDataSetMetaDataRS :?RequestState = useRequestState([EDM, GET_DATA_SET_METADATA]);

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const metadata :Map = useSelector(selectDataSetMetaData(dataSetId));

  const dataSetMetaData = get(metadata, DATA_SET, Map());
  const description :string = getPropertyValue(dataSetMetaData, [FQNS.OL_DESCRIPTION, 0]);
  const name :string = getPropertyValue(dataSetMetaData, [FQNS.OL_DATA_SET_NAME, 0]);
  const title :string = getPropertyValue(dataSetMetaData, [FQNS.OL_TITLE, 0]);

  const contact :string = useMemo(() => {
    const contactEmail :string = getPropertyValue(dataSetMetaData, [FQNS.CONTACT_EMAIL, 0]);
    const contactPhone :string = getPropertyValue(dataSetMetaData, [FQNS.CONTACT_PHONE_NUMBER, 0]);
    let contactString = '';
    if (isNonEmptyString(contactEmail) && isNonEmptyString(contactPhone)) {
      contactString = `${contactEmail} - ${contactPhone}`;
    }
    else if (isNonEmptyString(contactEmail)) {
      contactString = contactEmail;
    }
    else if (isNonEmptyString(contactPhone)) {
      contactString = contactPhone;
    }
    return contactString;
  }, [dataSetMetaData]);

  useEffect(() => {
    dispatch(getDataSetMetaData({ dataSetId, organizationId }));
    dispatch(getOwnerStatus(dataSetId));
  }, [dispatch, dataSetId, organizationId]);

  if (organization) {

    const renderDataSetDataContainer = () => (
      <DataSetDataContainer dataSetId={dataSetId} />
    );

    const renderDataSetMetaContainer = () => (
      <DataSetMetaDataContainer dataSetId={dataSetId} organizationId={organizationId} />
    );

    return (
      <>
        <AppContentWrapper>
          <Crumbs>
            <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
            <CrumbItem>{title || name}</CrumbItem>
          </Crumbs>
          {
            isPending(getDataSetMetaDataRS) && (
              <Spinner />
            )
          }
          {
            isSuccess(getDataSetMetaDataRS) && (
              <StackGrid gap={48}>
                <StackGrid>
                  <SpaceBetweenGrid>
                    <Typography variant="h1">{title || name}</Typography>
                    <DataSetActionButton dataSetId={dataSetId} organizationId={organizationId} />
                  </SpaceBetweenGrid>
                  <Typography>{description || name}</Typography>
                </StackGrid>
                <StackGrid>
                  <Typography variant="h4">Contact</Typography>
                  {
                    isNonEmptyString(contact)
                      ? (
                        <Typography>{contact}</Typography>
                      )
                      : (
                        <Typography>No contact information is available.</Typography>
                      )
                  }
                </StackGrid>
              </StackGrid>
            )
          }
        </AppContentWrapper>
        {
          isSuccess(getDataSetMetaDataRS) && (
            <>
              <NavContentWrapper bgColor="white">
                <AppNavigationWrapper borderless>
                  <NavLink exact strict to={dataSetRoute}>About</NavLink>
                  {
                    !isAtlasDataSet(dataSetMetaData) && (
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
