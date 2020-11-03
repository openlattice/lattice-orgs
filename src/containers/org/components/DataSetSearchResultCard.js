/*
 * @flow
 */

import React from 'react';

import { Map, getIn } from 'immutable';
import { Card, CardSegment, Typography } from 'lattice-ui-kit';
import { useGoToRoute } from 'lattice-utils';
import { useSelector } from 'react-redux';
import type { EntitySet, UUID } from 'lattice';

import { DataSetTitle, StackGrid } from '../../../components';
import { selectAtlasDataSets, selectEntitySets } from '../../../core/redux/selectors';
import { Routes } from '../../../core/router';

const DataSetSearchResultCard = ({
  dataSetId,
  organizationId
} :{|
  dataSetId :UUID;
  organizationId :UUID;
|}) => {

  const atlasDataSets :Map<UUID, Map> = useSelector(selectAtlasDataSets([dataSetId]));
  const atlasDataSet :?Map = atlasDataSets.get(dataSetId);

  const entitySets :Map<UUID, EntitySet> = useSelector(selectEntitySets([dataSetId]));
  const entitySet :?EntitySet = entitySets.get(dataSetId);

  const description :string = entitySet?.description || getIn(atlasDataSet, ['table', 'description']);
  const name :string = entitySet?.name || getIn(atlasDataSet, ['table', 'name']);
  const title :string = entitySet?.title || getIn(atlasDataSet, ['table', 'title']);

  const goToOrganizationDataSet = useGoToRoute(
    Routes.ORG_DATA_SET
      .replace(Routes.ORG_ID_PARAM, organizationId)
      .replace(Routes.DATA_SET_ID_PARAM, dataSetId)
  );

  return (
    <Card id={dataSetId} onClick={goToOrganizationDataSet}>
      <CardSegment>
        <StackGrid gap={8}>
          <DataSetTitle component="h2" isAtlasDataSet={!!atlasDataSet} variant="h4">{title || name}</DataSetTitle>
          <Typography>{description || name}</Typography>
        </StackGrid>
      </CardSegment>
    </Card>
  );
};

export default DataSetSearchResultCard;
