/*
 * @flow
 */
import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { ATLAS_DATA_SET_DATA, REQUEST_STATE } from '../../redux/constants';
import { FETCH_ATLAS_DATA_SET_DATA, fetchAtlasDataSetData } from '../actions';

export default function fetchAtlasDataSetDataReducer(state :Map, action :SequenceAction) {
  return fetchAtlasDataSetData.reducer(state, action, {
    REQUEST: () => {
      const { atlasDataSetId } = action.value;
      return state
        .setIn([FETCH_ATLAS_DATA_SET_DATA, atlasDataSetId, REQUEST_STATE], RequestStates.PENDING)
        .setIn([FETCH_ATLAS_DATA_SET_DATA, action.id], action);
    },
    SUCCESS: () => {
      if (state.hasIn([FETCH_ATLAS_DATA_SET_DATA, action.id])) {
        const storedSeqAction = state.getIn([FETCH_ATLAS_DATA_SET_DATA, action.id]);
        const { atlasDataSetId } :{ atlasDataSetId :UUID } = storedSeqAction.value;
        return state
          .setIn([ATLAS_DATA_SET_DATA, atlasDataSetId], fromJS(action.value))
          .setIn([FETCH_ATLAS_DATA_SET_DATA, atlasDataSetId, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {

      if (state.hasIn([FETCH_ATLAS_DATA_SET_DATA, action.id])) {
        const storedSeqAction = state.getIn([FETCH_ATLAS_DATA_SET_DATA, action.id]);
        const { atlasDataSetId } = storedSeqAction.value;
        return state.setIn([FETCH_ATLAS_DATA_SET_DATA, atlasDataSetId, REQUEST_STATE], RequestStates.FAILURE);
      }

      return state;
    },
    FINALLY: () => state.deleteIn([FETCH_ATLAS_DATA_SET_DATA, action.id]),
  });
}
