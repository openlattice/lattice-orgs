/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import { faExpandAlt } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
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
import type { FQN, Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { GET_DATA_SET_ACCESS_REQUESTS, getDataSetAccessRequests } from './actions';
import { DataSetAccessRequestModal } from './components';
import { RequestStatusTypes } from './constants';
import type { RequestStatusType } from './constants';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  GapGrid,
  SpaceBetweenGrid,
  Spinner,
  StackGrid,
} from '../../components';
import { FQNS } from '../../core/edm/constants';
import { REQUESTS } from '../../core/redux/constants';
import {
  selectDataSetAccessRequests,
  selectOrgDataSet,
  selectOrganization,
} from '../../core/redux/selectors';

const { NEUTRAL } = Colors;
// const { PermissionTypes } = Types;
const { getEntityKeyId, getPropertyValue } = DataUtils;
const { formatDateTime } = DateTimeUtils;
const { isPending, isSuccess } = ReduxUtils;

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

  const [targetRequest, setTargetRequest] = useState();

  const getDataSetAccessRequestsRS :?RequestState = useRequestState([REQUESTS, GET_DATA_SET_ACCESS_REQUESTS]);

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const dataSet :Map<FQN, List> = useSelector(selectOrgDataSet(organizationId, dataSetId));
  const requests :List = useSelector(selectDataSetAccessRequests(dataSetId));

  const name :string = getPropertyValue(dataSet, [FQNS.OL_DATA_SET_NAME, 0]);
  const title :string = getPropertyValue(dataSet, [FQNS.OL_TITLE, 0]);

  useEffect(() => {
    dispatch(getDataSetAccessRequests({ dataSetId, organizationId }));
  }, [dispatch, dataSetId, organizationId]);

  const getStatusTagMode = (status :RequestStatusType) => {
    if (status === RequestStatusTypes.APPROVED) {
      return 'success';
    }
    if (status === RequestStatusTypes.REJECTED) {
      return 'danger';
    }
    return 'info';
  };

  if (organization) {
    return (
      <AppContentWrapper>
        <Crumbs>
          <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
          <CrumbLink to={dataSetsRoute}>Data Sets</CrumbLink>
          <CrumbLink to={dataSetRoute}>{title || name}</CrumbLink>
          <CrumbItem>Access Requests</CrumbItem>
        </Crumbs>
        <StackGrid gap={24}>
          <StackGrid>
            <Typography variant="h1">Access Requests</Typography>
            <Typography>Manage data set access requests.</Typography>
          </StackGrid>
          {
            isPending(getDataSetAccessRequestsRS) && (
              <Spinner />
            )
          }
          {
            isSuccess(getDataSetAccessRequestsRS) && requests.isEmpty() && (
              <Typography>There are no requests for access.</Typography>
            )
          }
          <div>
            {
              isSuccess(getDataSetAccessRequestsRS) && !requests.isEmpty() && (
                requests.map((request :Map) => {
                  const status = getPropertyValue(request, [FQNS.OL_STATUS, 0]) || RequestStatusTypes.PENDING;
                  return (
                    <CardSegment key={getEntityKeyId(request)}>
                      <SpaceBetweenGrid>
                        <GapGrid>
                          <Tag mode={getStatusTagMode(status)}>{status}</Tag>
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
                          <IconButton aria-label="view access request" onClick={() => setTargetRequest(request)}>
                            <FontAwesomeIcon color={NEUTRAL.N800} fixedWidth icon={faExpandAlt} />
                          </IconButton>
                        </GapGrid>
                      </SpaceBetweenGrid>
                    </CardSegment>
                  );
                })
              )
            }
          </div>
        </StackGrid>
        <DataSetAccessRequestModal
            dataSetId={dataSetId}
            onClose={() => setTargetRequest()}
            organizationId={organizationId}
            request={targetRequest} />
      </AppContentWrapper>
    );
  }

  return null;
};

export default DataSetAccessRequestsContainer;
