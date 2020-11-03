/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import { List, Map, get } from 'immutable';
import { AppContentWrapper, Spinner, Table } from 'lattice-ui-kit';
import {
  DataUtils,
  Logger,
  useRequestState
} from 'lattice-utils';
import { useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { EntitySet, PropertyType, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { GET_SHIPROOM_METADATA } from './actions';

import { FQNS } from '../../core/edm/constants';
import { SHIPROOM } from '../../core/redux/constants';
import { selectEntitySetPropertyTypes } from '../../core/redux/selectors';

const LOG = new Logger('DataSetMetaContainer');

const { getPropertyValue } = DataUtils;

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

  const metadata :Map = useSelector((store) => store.getIn([SHIPROOM, 'metadata']));
  const metadataRS :?RequestState = useRequestState([SHIPROOM, GET_SHIPROOM_METADATA]);
  const propertyTypes :Map<UUID, PropertyType> = useSelector(selectEntitySetPropertyTypes(dataSetId));
  // BUG: unfortunately, I think hashCode() is computed every time since the Map is always "new"
  const propertyTypesHash :number = propertyTypes.hashCode();

  const parsedColumnInfo = useMemo(() => {
    const columninfo :List = getPropertyValue(metadata, FQNS.OL_COLUMN_INFO, List());
    try {
      const parsedColumns = JSON.parse(columninfo.first());
      const parsedColumnInfoWithIds = parsedColumns.map((column) => ({ id: column.propertyTypeId, ...column }));
      return parsedColumnInfoWithIds;
    }
    catch (error) {
      LOG.error(error);
      return undefined;
    }
  }, [metadata]);

  useEffect(() => {
    if (parsedColumnInfo) {
      setTableData(parsedColumnInfo);
    }
    else if (atlasDataSet) {
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
  }, [atlasDataSet, entitySet, parsedColumnInfo, propertyTypesHash]);

  if (metadataRS === RequestStates.PENDING) {
    return (
      <AppContentWrapper>
        <Spinner size="2x" />
      </AppContentWrapper>
    );
  }

  return (
    <AppContentWrapper>
      <Table data={tableData} headers={TABLE_HEADERS} />
    </AppContentWrapper>
  );
};

export default DataSetMetaContainer;
