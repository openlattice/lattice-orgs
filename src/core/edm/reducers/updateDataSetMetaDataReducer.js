/*
 * @flow
 */

import { List, Map } from 'immutable';
import { DataUtils } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  DATA_SET,
  DATA_SET_COLUMNS,
  METADATA,
  REQUEST_STATE,
} from '../../redux/constants';
import { UPDATE_DATA_SET_METADATA, updateDataSetMetaData } from '../actions';
import { FQNS } from '../constants';

const { getEntityKeyId } = DataUtils;

export default function reducer(state :Map, action :SequenceAction) {

  return updateDataSetMetaData.reducer(state, action, {
    REQUEST: () => state
      .setIn([UPDATE_DATA_SET_METADATA, REQUEST_STATE], RequestStates.PENDING)
      .setIn([UPDATE_DATA_SET_METADATA, action.id], action),
    SUCCESS: () => {
      const storedAction = state.getIn([UPDATE_DATA_SET_METADATA, action.id]);
      if (storedAction) {
        const {
          dataSetId,
          description,
          entityKeyId,
          isColumn,
          // organizationId,
          title,
        } :{|
          dataSetId :UUID;
          description :string;
          entityKeyId :UUID;
          isColumn ?:boolean;
          organizationId :UUID;
          title :string;
        |} = storedAction.value;
        if (isColumn) {
          const columns :List<Map> = state.getIn([METADATA, dataSetId, DATA_SET_COLUMNS], List());
          const targetIndex :number = columns.findIndex((column :Map) => getEntityKeyId(column) === entityKeyId);
          if (targetIndex >= 0) {
            return state
              .setIn([METADATA, dataSetId, DATA_SET_COLUMNS, targetIndex, FQNS.OL_DESCRIPTION], List([description]))
              .setIn([METADATA, dataSetId, DATA_SET_COLUMNS, targetIndex, FQNS.OL_TITLE], List([title]))
              .setIn([UPDATE_DATA_SET_METADATA, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        }
        return state
          .setIn([METADATA, dataSetId, DATA_SET, FQNS.OL_DESCRIPTION], List([description]))
          .setIn([METADATA, dataSetId, DATA_SET, FQNS.OL_TITLE], List([title]))
          .setIn([UPDATE_DATA_SET_METADATA, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([UPDATE_DATA_SET_METADATA, action.id])) {
        return state.setIn([UPDATE_DATA_SET_METADATA, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([UPDATE_DATA_SET_METADATA, action.id]),
  });
}
