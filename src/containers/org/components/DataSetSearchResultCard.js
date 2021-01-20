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
import { useSelector } from 'react-redux';
import type { EntitySet, UUID } from 'lattice';

import { DataSetTitle, StackGrid } from '../../../components';
import { FQNS } from '../../../core/edm/constants';
import { selectAtlasDataSets, selectEntitySets } from '../../../core/redux/selectors';
import { Routes } from '../../../core/router';
import { getDataSetField } from '../../../utils';

const { getPropertyValue } = DataUtils;
const { isNonEmptyString } = LangUtils;
const { isValidUUID } = ValidationUtils;

const DataSetSearchResultCard = ({
  organizationId,
  searchHit,
} :{|
  organizationId :UUID;
  searchHit :Map;
|}) => {

  const dataSetId :UUID = getPropertyValue(searchHit, [FQNS.OL_ID, 0]);
  const goToOrganizationDataSet = useGoToRoute(
    Routes.ORG_DATA_SET
      .replace(Routes.ORG_ID_PARAM, organizationId)
      .replace(Routes.DATA_SET_ID_PARAM, dataSetId)
  );

  const atlasDataSets :Map<UUID, Map> = useSelector(selectAtlasDataSets([dataSetId]));
  const entitySets :Map<UUID, EntitySet> = useSelector(selectEntitySets([dataSetId]));
  let dataSet = atlasDataSets.get(dataSetId) || entitySets.get(dataSetId);

  if (!isValidUUID(dataSetId)) {
    return null;
  }

  // NOTE: if "dataSet" is falsy, it most likely means the user doesn't have permissions to view it
  if (!dataSet) {
    const dataSetName :string = getPropertyValue(searchHit, [FQNS.OL_DATA_SET_NAME, 0]);
    if (isNonEmptyString(dataSetName)) {
      // NOTE: show "ol.dataset_name" when there's nothing else to show
      dataSet = Map({ name: dataSetName });
    }
    else {
      // NOTE: this is most likely a bad entity
      return null;
    }
  }

  return (
    <Card id={dataSetId} onClick={goToOrganizationDataSet}>
      <CardSegment>
        <StackGrid gap={8}>
          <DataSetTitle component="h2" dataSet={dataSet} variant="h4" />
          <Typography>{getDataSetField(dataSet, 'description') || getDataSetField(dataSet, 'name')}</Typography>
        </StackGrid>
      </CardSegment>
    </Card>
  );
};

export default DataSetSearchResultCard;
