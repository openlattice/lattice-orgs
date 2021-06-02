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
import { Models } from 'lattice';
import {
  CardSegment,
  Colors,
  PaginationToolbar,
  Table,
} from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { EntityDataRow } from './components';

import { TableCardSegment } from '../../components';
import { FETCH_ENTITY_SET_DATA, fetchEntitySetData } from '../../core/data/actions';
import { useEntityTypePropertyTypes } from '../../core/edm/utils';
import { resetRequestStates } from '../../core/redux/actions';
import { DATA } from '../../core/redux/constants';
import { selectOrgEntitySetData } from '../../core/redux/selectors';
import { MAX_HITS_10 } from '../../core/search/constants';

const { PropertyType } = Models;
const { isPending } = ReduxUtils;
const { PURPLE } = Colors;

type Props = {
  associationDataSet :Map,
  dataSet :Map;
  isModal :boolean;
  neighbors :List<Map>;
  organizationId :UUID;
};

const EntityNeighborsTable = ({
  associationDataSet,
  dataSet,
  isModal,
  neighbors,
  organizationId
} :Props) => {
  const associationDataSetId :UUID = get(associationDataSet, 'id');
  const dataSetId :UUID = get(dataSet, 'id');

  /*
   * NOTE: performance issue against prod
   * /explore/entityData/77f1b8d0-9c75-4e52-8176-eb6913a74669/f7cc0000-0000-0000-8000-0000000070ab
   */

  const dispatch = useDispatch();
  const [tableData, setTableData] = useState([]);
  const [tablePage, setTablePage] = useState(0);
  const [neighborsIndex, setNeighborsIndex] = useState(0);
  const fetchEntitySetDataRS :?RequestState = useRequestState([DATA, FETCH_ENTITY_SET_DATA, dataSetId]);

  const neighborToAssociationEKIDs :Map = useMemo(() => (
    Map().withMutations((mutableMap) => {
      if (neighbors) {
        neighbors
          .slice(neighborsIndex, neighborsIndex + MAX_HITS_10)
          .forEach((neighbor :Map) => mutableMap
            .set(get(neighbor, 'neighborId'), get(neighbor, 'associationId')));
      }
    })
  ), [neighbors, neighborsIndex]);

  const totalNeighbors :number = useMemo(() => (
    neighbors ? neighbors.count() : 0
  ), [neighbors]);

  // OPTIMIZE: no need to compute this on every render
  const associationPropertyTypes :PropertyType[] = useEntityTypePropertyTypes(associationDataSet.get('entityTypeId'));
  const neighborPropertyTypes :PropertyType[] = useEntityTypePropertyTypes(dataSet.get('entityTypeId'));

  // OPTIMIZE: no need to compute this on every render
  const tableHeaders = [];
  associationPropertyTypes.forEach((propertyType) => tableHeaders.push({
    key: `${propertyType.type.toString()}_edge`,
    label: `${propertyType.title} (${propertyType.type.toString()}) (Edge)`,
    sortable: false,
    cellStyle: { 'background-color': PURPLE.P00 }
  }));
  neighborPropertyTypes.forEach((propertyType) => tableHeaders.push({
    key: propertyType.type.toString(),
    label: `${propertyType.title} (${propertyType.type.toString()})`,
    sortable: false,
  }));

  // OPTIMIZE: no need to compute this on every render
  const dataSetData :Map = useSelector(selectOrgEntitySetData(dataSetId, neighborToAssociationEKIDs.keySeq()));
  const associationData :Map = useSelector(
    selectOrgEntitySetData(associationDataSetId, neighborToAssociationEKIDs.valueSeq())
  );

  useEffect(() => {
    if (fetchEntitySetDataRS === RequestStates.SUCCESS) {
      const newTableData = neighborToAssociationEKIDs.entrySeq()
        .map(([neighborEntityKeyId :UUID, associationEntityKeyId :UUID], index :number) => {
          // 'id' is used as the "key" prop in the table component, so it needs to be unique
          let entityData = dataSetData.get(neighborEntityKeyId).set('id', `${neighborEntityKeyId}-${index}`);
          associationData.get(associationEntityKeyId).forEach((value, key) => {
            entityData = entityData.set(`${key}_edge`, value);
          });
          return entityData;
        }).toJS(); // TODO: avoid .toJS()
      setTableData(newTableData);
    }
  // NOTE: leaving out "dataSetData" from depedency array because it tends to cause infinite renders
  // TODO: figure out how to avoid the infinite renders when "dataSetData" is passed
  }, [neighborToAssociationEKIDs, fetchEntitySetDataRS]);

  useEffect(() => {
    dispatch(
      fetchEntitySetData({
        entitySetId: associationDataSetId,
        entityKeyIds: Set(neighborToAssociationEKIDs.valueSeq().toJS()),
      })
    );
    dispatch(
      fetchEntitySetData({
        entitySetId: dataSetId,
        entityKeyIds: Set(neighborToAssociationEKIDs.keySeq().toJS()),
      })
    );
  }, [dispatch, neighborToAssociationEKIDs, dataSetId]);

  const handleOnPageChange = ({ page, start }) => {
    setTablePage(page);
    setNeighborsIndex(start);
    dispatch(resetRequestStates([FETCH_ENTITY_SET_DATA, dataSetId]));
  };

  const components = {
    Row: ({ data, headers } :Object) => (
      <EntityDataRow
          data={data}
          dataSetId={dataSetId}
          headers={headers}
          isModal={isModal}
          organizationId={organizationId} />
    )
  };

  return (
    <>
      <TableCardSegment borderless noWrap padding="0">
        <Table
            components={components}
            data={tableData}
            headers={tableHeaders}
            isLoading={isPending(fetchEntitySetDataRS)} />
      </TableCardSegment>
      <CardSegment borderless padding="0">
        <PaginationToolbar
            page={tablePage}
            count={totalNeighbors}
            onPageChange={handleOnPageChange}
            rowsPerPage={MAX_HITS_10} />
      </CardSegment>
    </>
  );
};

export default EntityNeighborsTable;
