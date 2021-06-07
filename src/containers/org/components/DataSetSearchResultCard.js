/*
 * @flow
 */

import React from 'react';

import { Map } from 'immutable';
import { Card, CardSegment, Typography } from 'lattice-ui-kit';
import {
  DataUtils,
  LangUtils,
  ValidationUtils,
  useGoToRoute,
} from 'lattice-utils';
import type { UUID } from 'lattice';

import { DataSetTitle, StackGrid } from '../../../components';
import { FQNS } from '../../../core/edm/constants';
import { Routes } from '../../../core/router';

const { getPropertyValue } = DataUtils;
const { isNonEmptyString } = LangUtils;
const { isValidUUID } = ValidationUtils;

const DataSetSearchResultCard = ({
  organizationId,
  searchResult,
} :{|
  organizationId :UUID;
  searchResult :Map;
|}) => {

  const dataSetId :UUID = getPropertyValue(searchResult, [FQNS.OL_ID, 0]);
  const goToOrganizationDataSet = useGoToRoute(
    Routes.ORG_DATA_SET
      .replace(Routes.ORG_ID_PARAM, organizationId)
      .replace(Routes.DATA_SET_ID_PARAM, dataSetId)
  );

  if (!isValidUUID(dataSetId)) {
    return null;
  }

  const description :string = getPropertyValue(searchResult, [FQNS.OL_DESCRIPTION, 0]);
  const name :string = getPropertyValue(searchResult, [FQNS.OL_DATA_SET_NAME, 0]);

  if (!isNonEmptyString(name)) {
    return null; // NOTE: likely to be a bad entity
  }

  return (
    <Card id={dataSetId} onClick={goToOrganizationDataSet}>
      <CardSegment>
        <StackGrid gap={8}>
          <DataSetTitle component="h2" dataSet={searchResult} variant="h4" />
          <Typography variant="subtitle1">{`${name}`}</Typography>
          <Typography variant="body1">{`Description: ${description || name}`}</Typography>
        </StackGrid>
      </CardSegment>
    </Card>
  );
};

export default DataSetSearchResultCard;
