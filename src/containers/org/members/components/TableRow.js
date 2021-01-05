// @flow

import React from 'react';

import styled from 'styled-components';
import { Map, getIn } from 'immutable';
import {
  Checkbox,
  Chip,
  Colors,
  Typography
} from 'lattice-ui-kit';

import { getUserProfile } from '../../../../utils/PersonUtils';

const { NEUTRAL } = Colors;

const Row = styled.tr`
  height: 56px;
`;

const Cell = styled.td`
  border: 1px solid ${NEUTRAL.N100};
  max-width: 0px;
  overflow: hidden;
  padding: ${(props) => (props.padding === 'small' ? '0 8px' : '0 16px')};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type Props = {
  member :Map;
};

const TableRow = ({
  member
} :Props) => {
  const { name } = getUserProfile(member);
  return (
    <Row>
      <Cell>
        <Checkbox />
      </Cell>
      <Cell as="th">
        <Typography align="left" noWrap>{name}</Typography>
      </Cell>
      <Cell>
        <Typography noWrap>Auth0</Typography>
      </Cell>
      <Cell padding="small">
        <Chip label="something" />
      </Cell>
    </Row>
  );
};

export default TableRow;
