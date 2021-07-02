/*
 * @flow
 */

import { List, Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  DATA_SET,
  DATA_SET_COLUMNS,
  ERROR,
  ORG_DATA_SETS,
  ORG_DATA_SET_COLUMNS,
  REQUEST_STATE,
} from '../../redux/constants';
import { INITIALIZE_ORGANIZATION_DATA_SET, initializeOrganizationDataSet } from '../actions';

export default function reducer(state :Map, action :SequenceAction) {

  return initializeOrganizationDataSet.reducer(state, action, {
    REQUEST: () => state
      .setIn([INITIALIZE_ORGANIZATION_DATA_SET, REQUEST_STATE], RequestStates.PENDING)
      .setIn([INITIALIZE_ORGANIZATION_DATA_SET, action.id], action),
    SUCCESS: () => {
      const storedAction = state.getIn([INITIALIZE_ORGANIZATION_DATA_SET, action.id]);
      if (storedAction) {
        const { dataSetId, organizationId } = storedAction.value;
        return state
          .setIn([ORG_DATA_SETS, organizationId, dataSetId], action.value[DATA_SET])
          .setIn([ORG_DATA_SET_COLUMNS, organizationId, dataSetId], action.value[DATA_SET_COLUMNS])
          .setIn([INITIALIZE_ORGANIZATION_DATA_SET, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      const storedAction = state.getIn([INITIALIZE_ORGANIZATION_DATA_SET, action.id]);
      if (storedAction) {
        const { dataSetId, organizationId } = storedAction.value;
        return state
          .setIn([ORG_DATA_SETS, organizationId, dataSetId], Map())
          .setIn([ORG_DATA_SET_COLUMNS, organizationId, dataSetId], List())
          .setIn([INITIALIZE_ORGANIZATION_DATA_SET, ERROR], action.value)
          .setIn([INITIALIZE_ORGANIZATION_DATA_SET, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([INITIALIZE_ORGANIZATION_DATA_SET, action.id]),
  });
}
