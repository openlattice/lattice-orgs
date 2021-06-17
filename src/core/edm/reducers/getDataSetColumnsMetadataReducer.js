/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { DataSetMetadataApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { ERROR, ORG_DATA_SET_COLUMNS, REQUEST_STATE } from '../../redux/constants';

const { GET_DATA_SET_COLUMNS_METADATA, getDataSetColumnsMetadata } = DataSetMetadataApiActions;

export default function reducer(state :Map, action :SequenceAction) {

  return getDataSetColumnsMetadata.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_DATA_SET_COLUMNS_METADATA, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_DATA_SET_COLUMNS_METADATA, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([GET_DATA_SET_COLUMNS_METADATA, action.id])) {
        let newState = state;
        fromJS(action.value).forEach((dataSetColumns :List<Map>) => {
          dataSetColumns.forEach((column :Map) => {
            const columnId :UUID = column.get('id');
            const dataSetId :UUID = column.get('dataSetId');
            const organizationId :UUID = column.get('organizationId');
            newState = newState.setIn([ORG_DATA_SET_COLUMNS, organizationId, dataSetId, columnId], column);
          });
        });
        return newState.setIn([GET_DATA_SET_COLUMNS_METADATA, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([GET_DATA_SET_COLUMNS_METADATA, action.id])) {
        return state
          .setIn([GET_DATA_SET_COLUMNS_METADATA, ERROR], action.value)
          .setIn([GET_DATA_SET_COLUMNS_METADATA, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GET_DATA_SET_COLUMNS_METADATA, action.id]),
  });
}
