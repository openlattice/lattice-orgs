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
import { AppContentWrapper, Table } from 'lattice-ui-kit';
import { DataUtils, ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import EditMetadataModal from './components/EditMetadataModal';
import EditableMetadataRow from './components/EditableMetadataRow';

import { Spinner } from '../../components';
import { GET_DATA_SET_METADATA, getDataSetMetaData } from '../../core/edm/actions';
import { FQNS } from '../../core/edm/constants';
import { DATA_SET_COLUMNS, EDM } from '../../core/redux/constants';
import { selectDataSetMetaData } from '../../core/redux/selectors';

const { getPropertyValue } = DataUtils;
const { isPending, isSuccess } = ReduxUtils;

const TABLE_HEADERS = [
  { key: 'title', label: 'TITLE' },
  { key: 'description', label: 'DESCRIPTION' },
  { key: 'type', label: 'DATA TYPE' },
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
  isVisible: false,
  selectedRowData: undefined,
};

const reducer = (state, action) => {
  switch (action.type) {
    case OPEN: {
      return {
        isVisible: true,
        selectedRowData: action.payload,
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
  isOwner,
  organizationId,
} :{|
  dataSetId :UUID;
  isOwner :boolean;
  organizationId :UUID;
|}) => {

  const dispatch = useDispatch();

  const [modalState, modalDispatch] = useReducer(reducer, INITIAL_MODAL_STATE);
  const [tableData, setTableData] = useState([]);

  const getDataSetMetaDataRS :?RequestState = useRequestState([EDM, GET_DATA_SET_METADATA]);

  const metadata :Map = useSelector(selectDataSetMetaData(dataSetId));

  useEffect(() => {
    dispatch(getDataSetMetaData({ dataSetId, organizationId }));
  }, [dispatch, dataSetId, organizationId]);

  useEffect(() => {
    // NOTE: the column EntityType is ol.column
    const data = get(metadata, DATA_SET_COLUMNS, List()).map((column :Map) => ({
      description: getPropertyValue(column, [FQNS.OL_DESCRIPTION, 0]),
      id: getPropertyValue(column, [FQNS.OL_ID, 0]),
      title: getPropertyValue(column, [FQNS.OL_TITLE, 0]),
      type: getPropertyValue(column, [FQNS.OL_TYPE, 0]),
    }));
    setTableData(data.toJS());
  }, [metadata]);

  const components = useMemo(() => ({
    Row: ({ data, components: innerComponents, headers } :any) => (
      <EditableMetadataRow
          components={innerComponents}
          data={data}
          headers={headers}
          isOwner={isOwner}
          key={data.id}
          onClick={() => modalDispatch({ type: OPEN, payload: data })} />
    )
  }), [isOwner]);

  return (
    <AppContentWrapper>
      {
        isPending(getDataSetMetaDataRS) && (
          <Spinner />
        )
      }
      {
        isSuccess(getDataSetMetaDataRS) && (
          <>
            <Table components={components} data={tableData} headers={TABLE_HEADERS} />
            <EditMetadataModal
                isVisible={modalState.isVisible}
                metadata={metadata}
                onClose={() => modalDispatch({ type: CLOSE })}
                property={modalState.selectedRowData} />
          </>
        )
      }
    </AppContentWrapper>
  );
};

export default DataSetMetaDataContainer;
