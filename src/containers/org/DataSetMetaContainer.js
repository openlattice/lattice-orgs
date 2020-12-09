/*
 * @flow
 */

import React, {
  useEffect,
  useMemo,
  useReducer,
  useState
} from 'react';

import { List, Map, get } from 'immutable';
import { Types } from 'lattice';
import { AppContentWrapper, Spinner, Table } from 'lattice-ui-kit';
import {
  DataUtils,
  Logger,
  useRequestState
} from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type {
  EntitySet,
  PropertyType,
  UUID
} from 'lattice';
import type { RequestState } from 'redux-reqseq';

import EditMetadataModal from './components/EditMetadataModal';
import EditableMetadataRow from './components/EditableMetadataRow';
import { GET_SHIPROOM_METADATA } from './actions';

import { FQNS } from '../../core/edm/constants';
import { getCurrentDataSetAuthorizations, getOwnerStatus } from '../../core/permissions/actions';
import { IS_OWNER, PERMISSIONS, SHIPROOM } from '../../core/redux/constants';
import { selectEntitySetPropertyTypes } from '../../core/redux/selectors';

const { PermissionTypes } = Types;

const LOG = new Logger('DataSetMetaContainer');

const { getPropertyValue } = DataUtils;

const TABLE_HEADERS = [
  { key: 'title', label: 'TITLE' },
  { key: 'description', label: 'DESCRIPTION' },
  { key: 'datatype', label: 'DATA TYPE' },
  {
    key: 'action',
    label: '',
    cellStyle: { width: '56px' },
    sortable: false
  }
];

const INITIAL_STATE = {
  isVisible: false,
  selectedRowData: undefined,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'open': {
      return {
        selectedRowData: action.payload,
        isVisible: true
      };
    }
    case 'close':
      return INITIAL_STATE;
    default:
      return state;
  }
};

const DataSetMetaContainer = ({
  atlasDataSet,
  dataSetId,
  entitySet,
} :{|
  atlasDataSet :?Map;
  dataSetId :UUID;
  entitySet :?EntitySet;
|}) => {

  const dispatch = useDispatch();
  const [tableData, setTableData] = useState([]);
  const [modalState, modalDispatch] = useReducer(reducer, INITIAL_STATE);
  const isOwner :boolean = useSelector((store) => store.getIn([PERMISSIONS, IS_OWNER, dataSetId]));

  const metadata :Map = useSelector((store) => store.getIn([SHIPROOM, 'metadata']));
  const metadataRS :?RequestState = useRequestState([SHIPROOM, GET_SHIPROOM_METADATA]);
  const propertyTypes :Map<UUID, PropertyType> = useSelector(selectEntitySetPropertyTypes(dataSetId));
  // BUG: unfortunately, I think hashCode() is computed every time since the Map is always "new"
  const propertyTypesHash :number = propertyTypes.hashCode();

  const parsedColumnInfo = useMemo(() => {
    const columninfo :List = getPropertyValue(metadata, FQNS.OL_COLUMN_INFO, List());
    try {
      const parsedColumns = JSON.parse(columninfo.first());
      const parsedColumnInfoWithIds = parsedColumns.map((column, index) => ({
        id: column.propertyTypeId,
        ...column,
        index,
      }));
      return parsedColumnInfoWithIds;
    }
    catch (error) {
      LOG.error(error);
      return undefined;
    }
  }, [metadata]);

  useEffect(() => {
    dispatch(getOwnerStatus(dataSetId));
    dispatch(getCurrentDataSetAuthorizations({
      acl: [dataSetId],
      permissions: [PermissionTypes.MATERIALIZE]
    }));
  }, [dispatch, dataSetId]);

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

  const components = useMemo(() => {
    if (parsedColumnInfo) {
      return {
        Row: ({ data, components: innerComponents, headers } :any) => (
          <EditableMetadataRow
              components={innerComponents}
              data={data}
              headers={headers}
              isOwner={isOwner}
              key={data.id}
              onClick={() => modalDispatch({ type: 'open', payload: data })} />
        )
      };
    }
    return {};
  }, [isOwner, parsedColumnInfo]);

  if (metadataRS === RequestStates.PENDING) {
    return (
      <AppContentWrapper>
        <Spinner size="2x" />
      </AppContentWrapper>
    );
  }

  return (
    <AppContentWrapper>
      <Table
          components={components}
          data={tableData}
          headers={TABLE_HEADERS} />
      <EditMetadataModal
          isVisible={modalState.isVisible}
          metadata={metadata}
          onClose={() => modalDispatch({ type: 'close' })}
          property={modalState.selectedRowData} />
    </AppContentWrapper>
  );
};

export default DataSetMetaContainer;
