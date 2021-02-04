/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import {
  List,
  Map,
  get,
  setIn,
} from 'immutable';
import { Types } from 'lattice';
import { Form } from 'lattice-fabricate';
import { AppContentWrapper, Typography } from 'lattice-ui-kit';
import { DataUtils, ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  INITIALIZE_DATA_SET_ACCESS_REQUEST,
  SUBMIT_DATA_SET_ACCESS_REQUEST,
  initializeDataSetAccessRequest,
  submitDataSetAccessRequest,
} from './actions';
import { DataSetAccessRequestSchema } from './schemas';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  Spinner,
} from '../../components';
import { FQNS } from '../../core/edm/constants';
import { resetRequestState } from '../../core/redux/actions';
import { DATA_SET, DATA_SET_COLUMNS, REQUESTS } from '../../core/redux/constants';
import {
  selectDataSetAccessRequestDataSchema,
  selectDataSetAccessRequestUISchema,
  selectDataSetMetaData,
  selectOrganization,
} from '../../core/redux/selectors';

const { PermissionTypes } = Types;
const { getPropertyValue } = DataUtils;
const { isPending, isSuccess } = ReduxUtils;

const {
  ACCESS_REQUEST_EAK,
  ACCESS_REQUEST_PSK,
  PERMISSION_TYPES,
} = DataSetAccessRequestSchema;

const DataSetAccessRequestContainer = ({
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

  const [data, setData] = useState({});

  const initRS :?RequestState = useRequestState([REQUESTS, INITIALIZE_DATA_SET_ACCESS_REQUEST]);
  const submitRS :?RequestState = useRequestState([REQUESTS, SUBMIT_DATA_SET_ACCESS_REQUEST]);

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const metadata :Map = useSelector(selectDataSetMetaData(dataSetId));
  const dataSchema = useSelector(selectDataSetAccessRequestDataSchema());
  const uiSchema = useSelector(selectDataSetAccessRequestUISchema());

  const dataSetMetaData = get(metadata, DATA_SET, Map());
  const dataSetColumnsMetaData = get(metadata, DATA_SET_COLUMNS, List());
  const name :string = getPropertyValue(dataSetMetaData, [FQNS.OL_DATA_SET_NAME, 0]);
  const title :string = getPropertyValue(dataSetMetaData, [FQNS.OL_TITLE, 0]);

  useEffect(() => () => {
    dispatch(resetRequestState([INITIALIZE_DATA_SET_ACCESS_REQUEST]));
    dispatch(resetRequestState([SUBMIT_DATA_SET_ACCESS_REQUEST]));
  }, [dispatch]);

  useEffect(() => {
    dispatch(initializeDataSetAccessRequest({ dataSetId, organizationId }));
  }, [dispatch, dataSetId, organizationId]);

  useEffect(() => {
    if (isSuccess(initRS)) {
      setData((prevData) => {
        let newData = prevData;
        // NOTE: initialize data with all columns selected by default
        newData = setIn(
          newData,
          [ACCESS_REQUEST_PSK, ACCESS_REQUEST_EAK, DATA_SET_COLUMNS],
          dataSetColumnsMetaData.map((column :Map) => getPropertyValue(column, [FQNS.OL_ID, 0])).toJS(),
        );
        // NOTE: initialize data with OWNER, READ, WRITE selected by default
        newData = setIn(
          newData,
          [ACCESS_REQUEST_PSK, ACCESS_REQUEST_EAK, PERMISSION_TYPES],
          [PermissionTypes.OWNER, PermissionTypes.READ, PermissionTypes.WRITE],
        );
        return newData;
      });
    }
  }, [initRS, dataSetColumnsMetaData]);

  if (organization) {

    const onChange = ({ formData }) => {
      setData(formData);
    };

    const onSubmit = () => {
      dispatch(
        submitDataSetAccessRequest({
          data,
          dataSetId,
          organizationId,
          schema: { dataSchema, uiSchema },
        })
      );
    };

    return (
      <AppContentWrapper>
        <Crumbs>
          <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
          <CrumbLink to={dataSetsRoute}>Data Sets</CrumbLink>
          <CrumbLink to={dataSetRoute}>{title || name}</CrumbLink>
          <CrumbItem>Request Access</CrumbItem>
        </Crumbs>
        {
          isPending(initRS) && (
            <Spinner />
          )
        }
        {
          isSuccess(initRS) && !isSuccess(submitRS) && (
            <Form
                disabled={isPending(submitRS) || isSuccess(submitRS)}
                formData={data}
                isSubmitting={isPending(submitRS)}
                onChange={onChange}
                onSubmit={onSubmit}
                schema={dataSchema}
                uiSchema={uiSchema} />
          )
        }
        {
          isSuccess(initRS) && isSuccess(submitRS) && (
            <Typography align="center">You have successfully submitted the request for access!</Typography>
          )
        }
      </AppContentWrapper>
    );
  }

  return null;
};

export default DataSetAccessRequestContainer;
