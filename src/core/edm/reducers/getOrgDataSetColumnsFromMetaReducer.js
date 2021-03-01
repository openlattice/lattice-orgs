/*
 * @flow
 */

import { List, Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { FQN, UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { ORG_DATA_SET_COLUMNS, REQUEST_STATE } from '../../redux/constants';
import { GET_ORG_DATA_SET_COLUMNS_FROM_META, getOrgDataSetColumnsFromMeta } from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  return getOrgDataSetColumnsFromMeta.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_ORG_DATA_SET_COLUMNS_FROM_META, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_ORG_DATA_SET_COLUMNS_FROM_META, action.id], action),
    SUCCESS: () => {
      const storedAction = state.getIn([GET_ORG_DATA_SET_COLUMNS_FROM_META, action.id]);
      if (storedAction) {
        const { organizationId } :{| organizationId :UUID |} = storedAction.value;
        const dataSetsColumns :Map<UUID, List<Map<FQN, List>>> = action.value;
        return state
          .mergeIn([ORG_DATA_SET_COLUMNS, organizationId], dataSetsColumns)
          .setIn([GET_ORG_DATA_SET_COLUMNS_FROM_META, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([GET_ORG_DATA_SET_COLUMNS_FROM_META, action.id])) {
        return state.setIn([GET_ORG_DATA_SET_COLUMNS_FROM_META, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GET_ORG_DATA_SET_COLUMNS_FROM_META, action.id]),
  });
}
