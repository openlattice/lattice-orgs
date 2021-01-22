/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';

import getDataSetAccessRequestsReducer from './getDataSetAccessRequestsReducer';
import initializeDataSetAccessRequestReducer from './initializeDataSetAccessRequestReducer';
import submitDataSetAccessRequestReducer from './submitDataSetAccessRequestReducer';

import { RESET_REQUEST_STATE } from '../../../core/redux/actions';
import {
  ACCESS_REQUESTS,
  ACCESS_REQUEST_DATA_SCHEMA,
  ACCESS_REQUEST_UI_SCHEMA,
  RS_INITIAL_STATE,
} from '../../../core/redux/constants';
import { resetRequestStateReducer } from '../../../core/redux/reducers';
import {
  GET_DATA_SET_ACCESS_REQUESTS,
  INITIALIZE_DATA_SET_ACCESS_REQUEST,
  SUBMIT_DATA_SET_ACCESS_REQUEST,
  getDataSetAccessRequests,
  initializeDataSetAccessRequest,
  submitDataSetAccessRequest,
} from '../actions';

const INITIAL_STATE :Map = fromJS({
  // actions
  [GET_DATA_SET_ACCESS_REQUESTS]: RS_INITIAL_STATE,
  [INITIALIZE_DATA_SET_ACCESS_REQUEST]: RS_INITIAL_STATE,
  [SUBMIT_DATA_SET_ACCESS_REQUEST]: RS_INITIAL_STATE,
  // data
  [ACCESS_REQUESTS]: Map(),
  [ACCESS_REQUEST_DATA_SCHEMA]: undefined,
  [ACCESS_REQUEST_UI_SCHEMA]: undefined,
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATE: {
      return resetRequestStateReducer(state, action);
    }

    case getDataSetAccessRequests.case(action.type): {
      return getDataSetAccessRequestsReducer(state, action);
    }

    case initializeDataSetAccessRequest.case(action.type): {
      return initializeDataSetAccessRequestReducer(state, action);
    }

    case submitDataSetAccessRequest.case(action.type): {
      return submitDataSetAccessRequestReducer(state, action);
    }

    default:
      return state;
  }
}
