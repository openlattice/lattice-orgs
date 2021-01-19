/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import { Map } from 'immutable';
import { Form } from 'lattice-fabricate';
import { AppContentWrapper } from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { EntitySet, Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  INITIALIZE_DATA_SET_ACCESS_REQUEST,
  SUBMIT_DATA_SET_ACCESS_REQUEST,
  initializeDataSetAccessRequest,
  submitDataSetAccessRequest,
} from './actions';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  Spinner,
} from '../../components';
import { resetRequestState } from '../../core/redux/actions';
import { REQUESTS } from '../../core/redux/constants';
import {
  selectDataSet,
  selectOrganization,
  selectDataSetAccessRequestDataSchema,
  selectDataSetAccessRequestUISchema,
} from '../../core/redux/selectors';
import { getDataSetField } from '../../utils';

const { isPending, isSuccess } = ReduxUtils;

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
  const dataSet :?EntitySet | Map = useSelector(selectDataSet(dataSetId));
  const dataSchema = useSelector(selectDataSetAccessRequestDataSchema());
  const uiSchema = useSelector(selectDataSetAccessRequestUISchema());

  const name :string = getDataSetField(dataSet, 'name');
  const title :string = getDataSetField(dataSet, 'title');

  useEffect(() => () => {
    dispatch(resetRequestState([INITIALIZE_DATA_SET_ACCESS_REQUEST]));
    dispatch(resetRequestState([SUBMIT_DATA_SET_ACCESS_REQUEST]));
  }, [dispatch]);

  useEffect(() => {
    dispatch(initializeDataSetAccessRequest({ dataSetId, organizationId }));
  }, [dispatch, dataSetId, organizationId]);

  if (organization) {

    const onChange = ({ formData }) => {
      // console.log(formData);
      setData(formData);
    };

    const onSubmit = () => {
      // console.log(data);
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
          isSuccess(initRS) && (
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
      </AppContentWrapper>
    );
  }

  return null;
};

export default DataSetAccessRequestContainer;
