/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { DataSetsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  ATLAS_DATA_SETS,
  REQUEST_STATE,
} from '../../redux/constants';

const { GET_ORGANIZATION_DATA_SETS, getOrganizationDataSets } = DataSetsApiActions;

export default function reducer(state :Map, action :SequenceAction) {

  return getOrganizationDataSets.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_ORGANIZATION_DATA_SETS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_ORGANIZATION_DATA_SETS, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([GET_ORGANIZATION_DATA_SETS, action.id])) {
        const atlasDataSets :Map<UUID, Map> = state.get(ATLAS_DATA_SETS)
          .withMutations((mutableMap :Map<UUID, Map>) => {
            action.value.forEach((dataSet :Object) => mutableMap.set(dataSet.id, fromJS(dataSet)));
          });
        return state
          .set(ATLAS_DATA_SETS, atlasDataSets)
          .setIn([GET_ORGANIZATION_DATA_SETS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([GET_ORGANIZATION_DATA_SETS, action.id])) {
        return state.setIn([GET_ORGANIZATION_DATA_SETS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GET_ORGANIZATION_DATA_SETS, action.id]),
  });
}
