/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { faChevronRight } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map, get } from 'immutable';
import { Button, Colors } from 'lattice-ui-kit';
import { ValidationUtils, useGoToRoute } from 'lattice-utils';
import { Link } from 'react-router-dom';
import type { UUID } from 'lattice';

import { ID, ORGANIZATION_ID } from '../../../common/constants';
import {
  BasicListCard,
  DataSetTitle,
  GapGrid,
  SpaceBetweenGrid,
} from '../../../components';
import { Routes } from '../../../core/router';

const { isValidUUID } = ValidationUtils;

const { NEUTRAL } = Colors;

const ListCard = styled(BasicListCard)`
  a {
    color: ${NEUTRAL.N700};
    text-decoration: none;
  }

  div > div:last-child > button:first-child {
    background-color: ${NEUTRAL.N100};
    margin-right: 10px;
    padding: 6px 12px;

    :hover {
      background-color: ${NEUTRAL.N200};
    }
  }
`;

const ContentGrid = styled(SpaceBetweenGrid)`
  width: 100%;
`;

const DataSetListCard = ({
  dataSet,
  removeDataSet
} :{
  dataSet :Map;
  removeDataSet :(dataSetId :UUID) => void;
}) => {
  const dataSetId = get(dataSet, ID);
  const organizationId = get(dataSet, ORGANIZATION_ID);

  const dataSetRoute = Routes.ORG_DATA_SET
    .replace(Routes.ORG_ID_PARAM, organizationId)
    .replace(Routes.DATA_SET_ID_PARAM, dataSetId);

  const goToOrganizationDataSet = useGoToRoute(dataSetRoute);

  const removeDataSetFromCollaboration = (e :SyntheticInputEvent<HTMLInputElement>) => {
    e.stopPropagation();
    removeDataSet(dataSet);
  };

  if (!isValidUUID(dataSetId)) {
    return null;
  }

  return (
    <ListCard key={dataSetId} onClick={goToOrganizationDataSet}>
      <ContentGrid>
        <Link to={dataSetRoute}><DataSetTitle dataSet={dataSet} /></Link>
        <GapGrid gap={8}>
          <Button onClick={removeDataSetFromCollaboration} size="small">Remove</Button>
          <FontAwesomeIcon size="sm" icon={faChevronRight} />
        </GapGrid>
      </ContentGrid>
    </ListCard>
  );
};

export default DataSetListCard;
