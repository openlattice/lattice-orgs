/*
 * @flow
 */

import React, {
  useEffect,
  useMemo,
  useReducer,
  useState
} from 'react';

import { List, Map } from 'immutable';
import { AppContentWrapper, Table } from 'lattice-ui-kit';
import { DataUtils } from 'lattice-utils';
import { useSelector } from 'react-redux';
import type { FQN, UUID } from 'lattice';

import EditMetadataModal from './components/EditMetadataModal';
import EditableMetadataRow from './components/EditableMetadataRow';

import { FQNS } from '../../core/edm/constants';
import { selectHasOwnerPermission, selectOrgDataSetColumns } from '../../core/redux/selectors';

const { getEntityKeyId, getPropertyValue } = DataUtils;

const TABLE_HEADERS = [
  { key: 'title', label: 'TITLE' },
  { key: 'description', label: 'DESCRIPTION' },
  { key: 'dataType', label: 'DATA TYPE' },
  {
    cellStyle: { width: '56px' }, // 36px icon width + 10px left/right padding
    key: 'action',
    label: '',
    sortable: false,
  },
];

const OPEN :'OPEN' = 'OPEN';
const CLOSE :'CLOSE' = 'CLOSE';

const INITIAL_MODAL_STATE = {
  data: {},
  isVisible: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case OPEN: {
      return {
        data: action.payload,
        isVisible: true,
      };
    }
    case CLOSE:
      return INITIAL_MODAL_STATE;
    default:
      return state;
  }
};

const DataSetMetaDataContainer = ({
  dataSetId,
  organizationId,
} :{|
  dataSetId :UUID;
  organizationId :UUID;
|}) => {

  const [modalState, modalDispatch] = useReducer(reducer, INITIAL_MODAL_STATE);
  const [tableData, setTableData] = useState([]);

  const dataSetColumns :List<Map<FQN, List>> = useSelector(selectOrgDataSetColumns(organizationId, dataSetId));
  const isDataSetOwner :boolean = useSelector(selectHasOwnerPermission(dataSetId));

  useEffect(() => {
    // NOTE: the column is ol.column
    const data :List = dataSetColumns.map((column :Map<FQN, List>) => ({
      dataType: getPropertyValue(column, [FQNS.OL_DATA_TYPE, 0]),
      description: getPropertyValue(column, [FQNS.OL_DESCRIPTION, 0]),
      id: getEntityKeyId(column),
      title: getPropertyValue(column, [FQNS.OL_TITLE, 0]),
    }));
    setTableData(data.toJS());
  }, [dataSetColumns]);

  const components = useMemo(() => ({
    Row: ({ data, components: innerComponents, headers } :any) => (
      <EditableMetadataRow
          components={innerComponents}
          data={data}
          headers={headers}
          isOwner={isDataSetOwner}
          key={data.id}
          onClick={() => modalDispatch({ type: OPEN, payload: data })} />
    )
  }), [isDataSetOwner]);

  return (
    <AppContentWrapper>
      <Table components={components} data={tableData} headers={TABLE_HEADERS} />
      <EditMetadataModal
          data={modalState.data}
          dataSetId={dataSetId}
          isColumn
          isVisible={modalState.isVisible}
          onClose={() => modalDispatch({ type: CLOSE })}
          organizationId={organizationId} />
    </AppContentWrapper>
  );
};

export default DataSetMetaDataContainer;
