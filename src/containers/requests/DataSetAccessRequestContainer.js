/*
 * @flow
 */

import React, { useEffect, useMemo, useReducer, useState } from 'react';

import styled from 'styled-components';
import { List, Map, Set } from 'immutable';
import { Form } from 'lattice-fabricate';
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
  NavContentWrapper,
  SpaceBetweenGrid,
  Spinner,
  StackGrid,
} from '../../components';
import { selectDataSet, selectOrganization } from '../../core/redux/selectors';
import { getDataSetField } from '../../utils';

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

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const dataSet :?EntitySet | Map = useSelector(selectDataSet(dataSetId));

  const name :string = getDataSetField(dataSet, 'name');
  const title :string = getDataSetField(dataSet, 'title');

  if (organization) {
    return (
      <AppContentWrapper>
        <Crumbs>
          <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
          <CrumbLink to={dataSetsRoute}>Data Sets</CrumbLink>
          <CrumbLink to={dataSetRoute}>{title || name}</CrumbLink>
          <CrumbItem>Request Access</CrumbItem>
        </Crumbs>
      </AppContentWrapper>
    );
  }

  return null;
};

export default DataSetAccessRequestContainer;
