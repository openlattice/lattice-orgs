/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import { List, Map, get } from 'immutable';
import { AppContentWrapper, Table } from 'lattice-ui-kit';
import { useSelector } from 'react-redux';
import type { EntitySet, PropertyType, UUID } from 'lattice';

import { selectEntitySetPropertyTypes } from '../../core/redux/selectors';

const TABLE_HEADERS = [
  { key: 'title', label: 'TITLE' },
  { key: 'description', label: 'DESCRIPTION' },
  { key: 'datatype', label: 'DATA TYPE' },
];

const DataSetMetaContainer = ({
  atlasDataSet,
  dataSetId,
  entitySet,
} :{|
  atlasDataSet :?Map;
  dataSetId :UUID;
  entitySet :?EntitySet;
|}) => {

  const [tableData, setTableData] = useState([]);

  const propertyTypes :Map<UUID, PropertyType> = useSelector(selectEntitySetPropertyTypes(dataSetId));
  // BUG: unfortunately, I think hashCode() is computed every time since the Map is always "new"
  const propertyTypesHash :number = propertyTypes.hashCode();

  useEffect(() => {
    if (atlasDataSet) {
      const columnsData = atlasDataSet
        .get('columns', List())
        .map((column) => ({
          id: get(column, 'id'),
          datatype: get(column, 'datatype'),
          description: get(column, 'description'),
          title: get(column, 'name'),
        }))
        .toJS(); // TODO: avoid .toJS()
      setTableData(columnsData);
    }
    else if (entitySet) {
      const propertyTypesData = propertyTypes
        .valueSeq()
        .map((propertyType :PropertyType) => ({
          id: propertyType.id,
          datatype: propertyType.datatype,
          description: propertyType.description,
          title: propertyType.title,
        }))
        .toJS(); // TODO: avoid .toJS()
      setTableData(propertyTypesData);
    }
    else {
      setTableData([]);
    }
  }, [atlasDataSet, entitySet, propertyTypesHash]);

  return (
    <AppContentWrapper>
      <Table data={tableData} headers={TABLE_HEADERS} />
    </AppContentWrapper>
  );
};

export default DataSetMetaContainer;
