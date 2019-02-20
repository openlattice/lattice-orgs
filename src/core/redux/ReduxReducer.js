/*
 * @flow
 */

import { connectRouter } from 'connected-react-router/immutable';
import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import { AppReducer } from '../../containers/app';
import { OrgsReducer } from '../../containers/orgs';

export default function reduxReducer(routerHistory :any) {

  return combineReducers({
    app: AppReducer,
    auth: AuthReducer,
    orgs: OrgsReducer,
    router: connectRouter(routerHistory),
  });
}
