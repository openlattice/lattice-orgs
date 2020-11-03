/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { faServer } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map, getIn } from 'immutable';
import { Card, CardSegment, Typography } from 'lattice-ui-kit';
import { useGoToRoute } from 'lattice-utils';
import { useSelector } from 'react-redux';
import type { EntitySet, UUID } from 'lattice';

import { EntitySetIcon } from '../../../assets/svg/icons';
import { StackGrid } from '../../../components';
import { selectAtlasDataSets, selectEntitySets } from '../../../core/redux/selectors';
import { Routes } from '../../../core/router';

// TODO: move into src/components
const TitleWrapper = styled.div`
  align-items: center;
  display: grid;
  grid-gap: 16px;
  grid-template-columns: auto 1fr;

  > span {
    word-break: break-all;
  }
`;

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
          <TitleWrapper>
            {
              atlasDataSet
                ? <FontAwesomeIcon fixedWidth icon={faServer} />
                : <EntitySetIcon />
            }
            <Typography component="h2" variant="h4">{title || name}</Typography>
          </TitleWrapper>
          <Typography>{description || name}</Typography>
        </StackGrid>
      </CardSegment>
    </Card>
  );
};

export default DataSetSearchResultCard;
