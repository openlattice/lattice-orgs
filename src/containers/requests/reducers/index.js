/*
 * @flow
 */

import { Map, fromJS } from 'immutable';

import initializeDataSetAccessRequestReducer from './initializeDataSetAccessRequestReducer';
import submitDataSetAccessRequestReducer from './submitDataSetAccessRequestReducer';

import { RESET_REQUEST_STATE } from '../../../core/redux/actions';
import {
  ACCESS_REQUEST_DATA_SCHEMA,
  ACCESS_REQUEST_UI_SCHEMA,
  RS_INITIAL_STATE,
} from '../../../core/redux/constants';
import { resetRequestStateReducer } from '../../../core/redux/reducers';
import {
  INITIALIZE_DATA_SET_ACCESS_REQUEST,
  SUBMIT_DATA_SET_ACCESS_REQUEST,
  initializeDataSetAccessRequest,
  submitDataSetAccessRequest,
} from '../actions';

const INITIAL_STATE :Map = fromJS({
  // actions
  [INITIALIZE_DATA_SET_ACCESS_REQUEST]: RS_INITIAL_STATE,
  [SUBMIT_DATA_SET_ACCESS_REQUEST]: RS_INITIAL_STATE,
  // data
  [ACCESS_REQUEST_DATA_SCHEMA]: undefined,
  [ACCESS_REQUEST_UI_SCHEMA]: undefined,
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATE: {
      return resetRequestStateReducer(state, action);
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
