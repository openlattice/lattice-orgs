/*
 * @flow
 */

import { connectRouter } from 'connected-react-router/immutable';
import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import { AppReducer } from '../../containers/app';
import { OrgsReducer } from '../../containers/orgs';
import { EDMReducer } from '../edm';
import { PermissionsReducer } from '../permissions';
import { UsersReducer } from '../users';

export default function reduxReducer(routerHistory :any) {

  return combineReducers({
    app: AppReducer,
    auth: AuthReducer,
    edm: EDMReducer,
    orgs: OrgsReducer,
    permissions: PermissionsReducer,
    router: connectRouter(routerHistory),
    users: UsersReducer,
  });
}
