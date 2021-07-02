/*
 * @flow
 */

import { List, Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { FQN, UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { ORG_DATA_SETS, REQUEST_STATE } from '../../redux/constants';
import { GET_ORG_DATA_SETS_FROM_META, getOrgDataSetsFromMeta } from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  return getOrgDataSetsFromMeta.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_ORG_DATA_SETS_FROM_META, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_ORG_DATA_SETS_FROM_META, action.id], action),
    SUCCESS: () => {
      const storedAction = state.getIn([GET_ORG_DATA_SETS_FROM_META, action.id]);
      if (storedAction) {
        const { organizationId } :{| organizationId :UUID |} = storedAction.value;
        const dataSets :Map<UUID, Map<FQN, List>> = action.value;
        return state
          .mergeIn([ORG_DATA_SETS, organizationId], dataSets)
          .setIn([GET_ORG_DATA_SETS_FROM_META, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([GET_ORG_DATA_SETS_FROM_META, action.id])) {
        return state.setIn([GET_ORG_DATA_SETS_FROM_META, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GET_ORG_DATA_SETS_FROM_META, action.id]),
  });
}
