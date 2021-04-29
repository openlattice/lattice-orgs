/*
 * @flow
 */

import React, { useState } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Colors, Label } from 'lattice-ui-kit';
import { DataUtils } from 'lattice-utils';

import { FQNS } from '../../core/edm/constants';

const { NEUTRAL } = Colors;
const { getPropertyValue } = DataUtils;

const DataGrid = styled.div`
  background: ${NEUTRAL.N050};
  display: grid;
  flex: 1;
  font-size: 14px;
  grid-gap: 20px 30px;
  grid-template-columns: repeat(auto-fill, minmax(200px, auto));

  > div {
    max-width: 500px;
    word-break: break-word;
  }
`;

const ValueList = styled.ul`
  list-style: ${({ size }) => (size > 1 ? 'disc' : 'none')} inside;
  margin: 0;
  padding-left: 2px;
`;

const ValueListItem = styled.li`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

type Props = {
  data :Object;
  dataSetColumns :Map[];
};

const EntityDataGrid = ({ data, dataSetColumns } :Props) => {
  const [showFull, setShowFull] = useState(false);

  const labels = {};
  dataSetColumns.forEach((column) => {
    const type = getPropertyValue(column, [FQNS.OL_TYPE, 0]);
    const title = getPropertyValue(column, [FQNS.OL_TITLE, 0]);
    labels[type] = title;
  });

  const items = [];
  dataSetColumns.forEach((column :Map) => {
    const type = getPropertyValue(column, [FQNS.OL_TYPE, 0]);
    const title = getPropertyValue(column, [FQNS.OL_TITLE, 0]);
    const values :List = data.get(type, List());

    const elements = [];
    if (!values.isEmpty()) {
      values.forEach((value, index) => {
        elements.push(
          <ValueListItem key={index.toString()}>{value}</ValueListItem>
        );
      });
    }

    if (elements.length) {
      items.push(
        <div key={type}>
          <Label subtle>{title}</Label>
          <ValueList size={elements.length}>{elements}</ValueList>
        </div>
      );
    }
  });

  return (
    <DataGrid>
      {items.slice(0, 4)}'

    </DataGrid>
  );
};

export default EntityDataGrid;
