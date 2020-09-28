/*
 * @flow
 */

import { Map, Set } from 'immutable';
import { DataSetsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  ATLAS_DATA_SET_IDS,
  REQUEST_STATE,
} from '../../../core/redux/constants';

const { GET_ORGANIZATION_DATA_SETS, getOrganizationDataSets } = DataSetsApiActions;

export default function reducer(state :Map, action :SequenceAction) {

  return getOrganizationDataSets.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_ORGANIZATION_DATA_SETS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_ORGANIZATION_DATA_SETS, action.id], action),
    SUCCESS: () => {
      const storedAction = state.getIn([GET_ORGANIZATION_DATA_SETS, action.id]);
      if (storedAction) {
        const { organizationId } = storedAction.value;
        const atlasDataSetIds = Set(action.value.map((dataSet) => dataSet.id));
        return state
          .setIn([ATLAS_DATA_SET_IDS, organizationId], atlasDataSetIds)
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
