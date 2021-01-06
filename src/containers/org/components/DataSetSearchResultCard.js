/*
 * @flow
 */

import React from 'react';

import { Map } from 'immutable';
import { Card, CardSegment, Typography } from 'lattice-ui-kit';
import { useGoToRoute } from 'lattice-utils';
import { useSelector } from 'react-redux';
import type { EntitySet, UUID } from 'lattice';

import { DataSetTitle, StackGrid } from '../../../components';
import { selectAtlasDataSets, selectEntitySets } from '../../../core/redux/selectors';
import { Routes } from '../../../core/router';
import { getDataSetField } from '../../../utils';

const DataSetSearchResultCard = ({
  dataSetId,
  organizationId
} :{|
  dataSetId :UUID;
  organizationId :UUID;
|}) => {

  const atlasDataSets :Map<UUID, Map> = useSelector(selectAtlasDataSets([dataSetId]));
  const entitySets :Map<UUID, EntitySet> = useSelector(selectEntitySets([dataSetId]));
  const dataSet = atlasDataSets.get(dataSetId) || entitySets.get(dataSetId);

  const goToOrganizationDataSet = useGoToRoute(
    Routes.ORG_DATA_SET
      .replace(Routes.ORG_ID_PARAM, organizationId)
      .replace(Routes.DATA_SET_ID_PARAM, dataSetId)
  );

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
