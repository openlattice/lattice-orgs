/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { PrincipalsApiActions } from 'lattice-sagas';

import clearAtlasCredentialsReducer from './clearAtlasCredentialsReducer';
import getAtlasCredentialsReducer from './getAtlasCredentialsReducer';

import { ATLAS_CREDENTIALS, RS_INITIAL_STATE } from '../../../core/redux/constants';
import { CLEAR_ATLAS_CREDENTIALS } from '../actions';

const { GET_ATLAS_CREDENTIALS, getAtlasCredentials } = PrincipalsApiActions;

const INITIAL_STATE :Map = fromJS({
  // actions
  [GET_ATLAS_CREDENTIALS]: RS_INITIAL_STATE,
  // data
  [ATLAS_CREDENTIALS]: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case CLEAR_ATLAS_CREDENTIALS: {
      return clearAtlasCredentialsReducer(state);
    }

    case getAtlasCredentials.case(action.type): {
      return getAtlasCredentialsReducer(state, action);
    }

    default:
      return state;
  }
}
