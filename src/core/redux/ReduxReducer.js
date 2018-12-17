/*
 * @flow
 */

import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import { AppReducer } from '../../containers/app';
import { OrgsReducer } from '../../containers/orgs';

export default function reduxReducer() {

  return combineReducers({
    app: AppReducer,
    auth: AuthReducer,
    orgs: OrgsReducer,
  });
}
