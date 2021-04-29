/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { Cell, Colors, StyleUtils } from 'lattice-ui-kit';
import { DataUtils } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import type { UUID } from 'lattice';

import { Routes } from '../../../core/router';
import { goToRoute } from '../../../core/router/actions';

const { NEUTRAL } = Colors;
const { getEntityKeyId } = DataUtils;

const StyledTableRow = styled.tr`
  background-color: transparent;
  border-bottom: 1px solid ${NEUTRAL.N100};
  ${StyleUtils.getHoverStyles};
`;

type Props = {
  data :Object;
  dataSetId :UUID;
  headers :Object[];
  organizationId :UUID;
};

const EntityDataRow = ({
  data,
  dataSetId,
  headers,
  organizationId
} :Props) => {

  const dispatch = useDispatch();

  const entityKeyId :UUID = (getEntityKeyId(data) :any);

  const cells = headers.map((header) => (
    <Cell key={`${entityKeyId}_cell_${header.key}`}>{data[header.key]}</Cell>
  ));

  const entityDetailsPath = Routes.ORG_DATA_SET_DATA_DETAILS
    .replace(Routes.ORG_ID_PARAM, organizationId)
    .replace(Routes.DATA_SET_ID_PARAM, dataSetId)
    .replace(Routes.ENTITY_KEY_ID, entityKeyId);

  const goToEntityData = () => dispatch(goToRoute(
    entityDetailsPath,
    { data },
  ));

  return (
    <StyledTableRow onClick={goToEntityData}>
      {cells}
    </StyledTableRow>
  );
};

export default EntityDataRow;
