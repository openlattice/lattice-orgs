/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import {
  List,
  Map,
  Set,
  get
} from 'immutable';
import {
  Card,
  CardSegment,
  PaginationToolbar,
  Table,
} from 'lattice-ui-kit';
import { Models } from 'lattice';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { DataSetTitle, TableCardSegment } from '../../components';
import { EntityDataRow } from './components';
import { FETCH_ENTITY_SET_DATA, fetchEntitySetData } from '../../core/data/actions';
import { useEntitySetData } from '../../core/data/utils';
import { useEntityTypePropertyTypes } from '../../core/edm/utils';
import { resetRequestState } from '../../core/redux/actions';
import { DATA } from '../../core/redux/constants';
import { MAX_HITS_10 } from '../../core/search/constants';

const { PropertyType } = Models;
const { isPending } = ReduxUtils;

type Props = {
  dataSet :Map;
  neighbors :List<Map>;
  organizationId :UUID;
};

const EntityNeighborsCardContainer = ({ dataSet, neighbors, organizationId } :Props) => {

  const dataSetId :UUID = (dataSet.get('id') :any);

  /*
   * NOTE: performance issue against prod
   * /explore/entityData/77f1b8d0-9c75-4e52-8176-eb6913a74669/f7cc0000-0000-0000-8000-0000000070ab
   */

  const dispatch = useDispatch();
  const [tableData, setTableData] = useState([]);
  const [tablePage, setTablePage] = useState(0);
  const [neighborsIndex, setNeighborsIndex] = useState(0);
  const fetchEntitySetDataRS :?RequestState = useRequestState([DATA, FETCH_ENTITY_SET_DATA, dataSetId]);

  const entityKeyIds :List<UUID> = useMemo(() => (
    List().withMutations((list) => {
      if (neighbors) {
        neighbors
          .slice(neighborsIndex, neighborsIndex + MAX_HITS_10)
          .reduce((ids :List<UUID>, neighbor :Map) => ids.push(get(neighbor, 'neighborId')), list);
      }
    })
  ), [neighbors, neighborsIndex]);

  const totalNeighbors :number = useMemo(() => (
    neighbors ? neighbors.count() : 0
  ), [neighbors]);

  // OPTIMIZE: no need to compute this on every render
  const propertyTypes :PropertyType[] = useEntityTypePropertyTypes(dataSet.get('entityTypeId'));

  // OPTIMIZE: no need to compute this on every render
  const tableHeaders = propertyTypes.map((propertyType) => ({
    key: propertyType.type.toString(),
    label: `${propertyType.title} (${propertyType.type.toString()})`,
    sortable: false,
  }));

  // OPTIMIZE: no need to compute this on every render
  const dataSetData :Map = useEntitySetData(dataSetId, entityKeyIds);

  useEffect(() => {
    if (fetchEntitySetDataRS === RequestStates.SUCCESS) {
      const newTableData = entityKeyIds
        .map((entityKeyId :UUID, index :number) => (
          // 'id' is used as the "key" prop in the table component, so it needs to be unique
          dataSetData.get(entityKeyId).set('id', `${entityKeyId}-${index}`)
        ))
        .toJS(); // TODO: avoid .toJS()
      setTableData(newTableData);
    }
  // NOTE: leaving out "dataSetData" from depedency array because it tends to cause infinite renders
  // TODO: figure out how to avoid the infinite renders when "dataSetData" is passed
  }, [entityKeyIds, fetchEntitySetDataRS]);

  useEffect(() => {
    dispatch(
      fetchEntitySetData({
        entitySetId: dataSetId,
        entityKeyIds: Set(entityKeyIds),
      })
    );
  }, [dispatch, entityKeyIds, dataSetId]);

  const handleOnPageChange = ({ page, start }) => {
    setTablePage(page);
    setNeighborsIndex(start);
    dispatch(resetRequestState([FETCH_ENTITY_SET_DATA, dataSetId]));
  };

  const components = {
    Row: ({ data, headers } :Object) => (
      <EntityDataRow data={data} dataSetId={dataSetId} headers={headers} organizationId={organizationId} />
    )
  };

  return (
    <Card>
      <CardSegment>
        <DataSetTitle component="h3" dataSet={dataSet} variant="h4" />
      </CardSegment>
      <CardSegment borderless padding="2px 30px">
        <PaginationToolbar
            page={tablePage}
            count={totalNeighbors}
            onPageChange={handleOnPageChange}
            rowsPerPage={MAX_HITS_10} />
      </CardSegment>
      <TableCardSegment borderless padding="0 30px" noWrap>
        <Table
            components={components}
            data={tableData}
            headers={tableHeaders}
            isLoading={isPending(fetchEntitySetDataRS)} />
      </TableCardSegment>
      <CardSegment padding="2px 30px 30px 30px">
        <PaginationToolbar
            page={tablePage}
            count={totalNeighbors}
            onPageChange={handleOnPageChange}
            rowsPerPage={MAX_HITS_10} />
      </CardSegment>
    </Card>
  );
};

export default EntityNeighborsCardContainer;
