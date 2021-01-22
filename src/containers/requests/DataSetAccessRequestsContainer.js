/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import { faExpandAlt } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map, get } from 'immutable';
import {
  AppContentWrapper,
  CardSegment,
  Colors,
  IconButton,
  Tag,
  Typography,
} from 'lattice-ui-kit';
import {
  DataUtils,
  DateTimeUtils,
  ReduxUtils,
  useRequestState,
} from 'lattice-utils';
import { DateTime } from 'luxon';
import { useDispatch, useSelector } from 'react-redux';
import type { Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { GET_DATA_SET_ACCESS_REQUESTS, getDataSetAccessRequests } from './actions';
import { DataSetAccessRequestModal } from './components';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  GapGrid,
  SpaceBetweenGrid,
  Spinner,
  StackGrid,
} from '../../components';
import { GET_DATA_SET_METADATA, getDataSetMetaData } from '../../core/edm/actions';
import { FQNS } from '../../core/edm/constants';
import { DATA_SET, EDM, REQUESTS } from '../../core/redux/constants';
import {
  selectDataSetAccessRequests,
  selectDataSetMetaData,
  selectOrganization,
} from '../../core/redux/selectors';

const { NEUTRAL } = Colors;
// const { PermissionTypes } = Types;
const { getEntityKeyId, getPropertyValue } = DataUtils;
const { formatDateTime } = DateTimeUtils;
const { isPending, isSuccess, reduceRequestStates } = ReduxUtils;

const DataSetAccessRequestsContainer = ({
  dataSetId,
  dataSetRoute,
  dataSetsRoute,
  organizationId,
  organizationRoute,
} :{|
  dataSetId :UUID;
  dataSetRoute :string;
  dataSetsRoute :string;
  organizationId :UUID;
  organizationRoute :string;
|}) => {

  const dispatch = useDispatch();

  const [accessRequest, setAccessRequest] = useState();

  const getDataSetAccessRequestsRS :?RequestState = useRequestState([REQUESTS, GET_DATA_SET_ACCESS_REQUESTS]);
  const getDataSetMetaDataRS :?RequestState = useRequestState([EDM, GET_DATA_SET_METADATA]);

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const metadata :Map = useSelector(selectDataSetMetaData(dataSetId));
  const requests :List = useSelector(selectDataSetAccessRequests(dataSetId));

  const dataSetMetaData = get(metadata, DATA_SET, Map());
  const name :string = getPropertyValue(dataSetMetaData, [FQNS.OL_DATA_SET_NAME, 0]);
  const title :string = getPropertyValue(dataSetMetaData, [FQNS.OL_TITLE, 0]);

  useEffect(() => {
    dispatch(getDataSetMetaData({ dataSetId, organizationId }));
    dispatch(getDataSetAccessRequests({ dataSetId, organizationId }));
  }, [dispatch, dataSetId, organizationId]);

  const requestState :?RequestState = reduceRequestStates([getDataSetAccessRequestsRS, getDataSetMetaDataRS]);

  if (organization) {
    return (
      <AppContentWrapper>
        <Crumbs>
          <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
          <CrumbLink to={dataSetsRoute}>Data Sets</CrumbLink>
          <CrumbLink to={dataSetRoute}>{title || name}</CrumbLink>
          <CrumbItem>Access Requests</CrumbItem>
        </Crumbs>
        <StackGrid>
          <Typography variant="h1">Access Requests</Typography>
          {
            isPending(requestState) && (
              <Spinner />
            )
          }
          {
            isSuccess(requestState) && requests.isEmpty() && (
              <Typography>There are no requests for access.</Typography>
            )
          }
          {
            isSuccess(requestState) && !requests.isEmpty() && (
              requests.map((request :Map) => (
                <CardSegment key={getEntityKeyId(request)}>
                  <SpaceBetweenGrid>
                    <GapGrid>
                      <Tag>{getPropertyValue(request, [FQNS.OL_STATUS, 0]).toUpperCase() || 'PENDING'}</Tag>
                      <Typography>{getPropertyValue(request, [FQNS.OL_REQUEST_PRINCIPAL_ID, 0])}</Typography>
                    </GapGrid>
                    <GapGrid>
                      <Typography>
                        {
                          formatDateTime(
                            getPropertyValue(request, [FQNS.OL_REQUEST_DATE_TIME, 0]),
                            DateTime.DATETIME_MED,
                          )
                        }
                      </Typography>
                      <IconButton aria-label="view access request" onClick={() => setAccessRequest(request)}>
                        <FontAwesomeIcon color={NEUTRAL.N800} fixedWidth icon={faExpandAlt} />
                      </IconButton>
                    </GapGrid>
                  </SpaceBetweenGrid>
                </CardSegment>
              ))
            )
          }
        </StackGrid>
        <DataSetAccessRequestModal accessRequest={accessRequest} onClose={() => setAccessRequest()} />
      </AppContentWrapper>
    );
  }

  return null;
};

export default DataSetAccessRequestsContainer;
