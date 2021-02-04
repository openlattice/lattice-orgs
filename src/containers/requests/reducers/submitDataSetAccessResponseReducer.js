/*
 * @flow
 */

import { List, Map } from 'immutable';
import { DataUtils } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { FQNS } from '../../../core/edm/constants';
import { ACCESS_REQUESTS, REQUEST_STATE } from '../../../core/redux/constants';
import { SUBMIT_DATA_SET_ACCESS_RESPONSE, submitDataSetAccessResponse } from '../actions';
import type { RequestStatusType } from '../constants';

const { getEntityKeyId } = DataUtils;

export default function reducer(state :Map, action :SequenceAction) {

  return submitDataSetAccessResponse.reducer(state, action, {
    REQUEST: () => state
      .setIn([SUBMIT_DATA_SET_ACCESS_RESPONSE, REQUEST_STATE], RequestStates.PENDING)
      .setIn([SUBMIT_DATA_SET_ACCESS_RESPONSE, action.id], action),
    SUCCESS: () => {
      const storedAction = state.getIn([SUBMIT_DATA_SET_ACCESS_RESPONSE, action.id]);
      if (storedAction) {
        const {
          dataSetId,
          request,
          status,
        } :{
          dataSetId :UUID;
          request :Map;
          organizationId :UUID;
          status :RequestStatusType;
        } = storedAction.value;
        const requests :List<Map> = state.getIn([ACCESS_REQUESTS, dataSetId], List());
        const targetIndex :number = requests.findIndex((r :Map) => getEntityKeyId(r) === getEntityKeyId(request));
        if (targetIndex >= 0) {
          return state
            .setIn([ACCESS_REQUESTS, dataSetId, targetIndex, FQNS.OL_STATUS], List([status]))
            .setIn([SUBMIT_DATA_SET_ACCESS_RESPONSE, REQUEST_STATE], RequestStates.SUCCESS);
        }
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([SUBMIT_DATA_SET_ACCESS_RESPONSE, action.id])) {
        return state.setIn([SUBMIT_DATA_SET_ACCESS_RESPONSE, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([SUBMIT_DATA_SET_ACCESS_RESPONSE, action.id]),
  });
}
