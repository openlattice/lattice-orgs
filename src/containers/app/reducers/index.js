/*
 * @flow
 */

import { Map, fromJS } from 'immutable';

import initializeApplicationReducer from './initializeApplicationReducer';

import { RESET_REQUEST_STATES } from '../../../core/redux/actions';
import { RS_INITIAL_STATE } from '../../../common/constants';
import { resetRequestStatesReducer } from '../../../core/redux/reducers';
import { INITIALIZE_APPLICATION, initializeApplication } from '../actions';

const INITIAL_STATE :Map = fromJS({
  [INITIALIZE_APPLICATION]: RS_INITIAL_STATE,
});

export default function reducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATES: {
      return resetRequestStatesReducer(state, action);
    }

    case initializeApplication.case(action.type): {
      return initializeApplicationReducer(state, action);
    }

    default:
      return state;
  }
}
