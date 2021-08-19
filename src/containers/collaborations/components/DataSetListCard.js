// @flow
import React from 'react';

import styled from 'styled-components';
import { faChevronRight } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map, fromJS, get } from 'immutable';
import { Button, Colors } from 'lattice-ui-kit';
import { ValidationUtils, useGoToRoute } from 'lattice-utils';
import type { UUID } from 'lattice';

import {
  DataSetTitle,
  GapGrid,
  SpaceBetweenGrid,
} from '../../../components';
import { Routes } from '../../../core/router';
import { ID, ORGANIZATION_ID } from '../../../utils/constants';

const { isValidUUID } = ValidationUtils;

const { NEUTRAL } = Colors;

const BasicListCard = styled.div`
  align-items: center;
  background-color: ${NEUTRAL.N50};
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  padding: 8px 16px;

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

  const goToOrganizationDataSet = useGoToRoute(
    Routes.ORG_DATA_SET
      .replace(Routes.ORG_ID_PARAM, organizationId)
      .replace(Routes.DATA_SET_ID_PARAM, dataSetId)
  );

  const removeDataSetFromCollaboration = (e :SyntheticInputEvent<HTMLInputElement>) => {
    e.stopPropagation();
    removeDataSet(dataSet);
  };

  if (!isValidUUID(dataSetId)) {
    return null;
  }

  return (
    <BasicListCard key={dataSetId} onClick={goToOrganizationDataSet}>
      <ContentGrid>
        <DataSetTitle dataSet={fromJS(dataSet)} />
        <GapGrid gap={8}>
          <Button onClick={removeDataSetFromCollaboration} size="small">Remove</Button>
          <FontAwesomeIcon size="sm" icon={faChevronRight} />
        </GapGrid>
      </ContentGrid>
    </BasicListCard>
  );
};

export default DataSetListCard;