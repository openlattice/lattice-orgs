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
import { DataUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { FQN, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import EditableMetadataRow from './components/EditableMetadataRow';

import { UpdateMetaModal } from '../../components';
import { UPDATE_ORGANIZATION_DATA_SET, updateOrganizationDataSet } from '../../core/edm/actions';
import { FQNS } from '../../core/edm/constants';
import { EDM } from '../../core/redux/constants';
import { selectMyKeys, selectOrgDataSetColumns } from '../../core/redux/selectors';

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

const DATA_SCHEMA = {
  properties: {
    fields: {
      properties: {
        title: {
          description: 'Update this column\'s title',
          title: 'Title',
          type: 'string',
        },
        description: {
          description: 'Update this column\'s description',
          title: 'Description',
          type: 'string',
        },
      },
      required: ['title'],
      title: '',
      type: 'object',
    },
  },
  title: '',
  type: 'object',
};

const UI_SCHEMA = {
  fields: {
    classNames: 'column-span-12 grid-container',
    title: {
      classNames: 'column-span-12',
    },
    description: {
      classNames: 'column-span-12',
      'ui:widget': 'textarea',
    },
  },
};

const OPEN :'OPEN' = 'OPEN';
const CLOSE :'CLOSE' = 'CLOSE';

const INITIAL_MODAL_STATE = {
  data: {},
  isVisible: false,
  schema: {
    dataSchema: DATA_SCHEMA,
    uiSchema: UI_SCHEMA,
  },
};

const reducer = (state, action) => {
  switch (action.type) {
    case OPEN: {
      const dataSchema = JSON.parse(JSON.stringify(DATA_SCHEMA));
      dataSchema.properties.fields.properties.title.default = action.payload.title || '';
      dataSchema.properties.fields.properties.description.default = action.payload.description || '';
      return {
        data: action.payload,
        isVisible: true,
        schema: {
          dataSchema,
          uiSchema: UI_SCHEMA
        },
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

  const dispatch = useDispatch();

  const [modalState, modalDispatch] = useReducer(reducer, INITIAL_MODAL_STATE);
  const [tableData, setTableData] = useState([]);

  const updateOrgDataSetRS :?RequestState = useRequestState([EDM, UPDATE_ORGANIZATION_DATA_SET]);

  const dataSetColumns :List<Map<FQN, List>> = useSelector(selectOrgDataSetColumns(organizationId, dataSetId));
  const myKeys :Set<List<UUID>> = useSelector(selectMyKeys());
  const isDataSetOwner :boolean = myKeys.has(List([dataSetId]));

  useEffect(() => {
    // NOTE: the column is ol.column
    const data :List = dataSetColumns
      .sortBy((column :Map<FQN, List>) => getPropertyValue(column, [FQNS.OL_INDEX, 0]))
      .map((column :Map<FQN, List>) => ({
        dataType: getPropertyValue(column, [FQNS.OL_DATA_TYPE, 0]),
        description: getPropertyValue(column, [FQNS.OL_DESCRIPTION, 0]),
        id: getEntityKeyId(column),
        title: getPropertyValue(column, [FQNS.OL_TITLE, 0]),
      }));
    setTableData(data.toJS());
  }, [dataSetColumns]);

  const handleOnSubmitUpdate = ({ description, title }) => {
    dispatch(
      updateOrganizationDataSet({
        dataSetId,
        description,
        entityKeyId: modalState.data.id,
        isColumn: true,
        organizationId,
        title,
      })
    );
  };

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
      <UpdateMetaModal
          isVisible={modalState.isVisible}
          onClose={() => modalDispatch({ type: CLOSE })}
          onSubmit={handleOnSubmitUpdate}
          requestState={updateOrgDataSetRS}
          requestStateAction={UPDATE_ORGANIZATION_DATA_SET}
          schema={modalState.schema} />
    </AppContentWrapper>
  );
};

export default DataSetMetaDataContainer;
