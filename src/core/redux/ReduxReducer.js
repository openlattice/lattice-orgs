/*
 * @flow
 */

import { connectRouter } from 'connected-react-router/immutable';
import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import { REDUCERS } from './constants';

import { AppReducer } from '../../containers/app';
import { OrgsReducer } from '../../containers/orgs';
import { EDMReducer } from '../edm';
import { PermissionsReducer } from '../permissions';
import { UsersReducer } from '../users';

export default function reduxReducer(routerHistory :any) {

  return combineReducers({
    [REDUCERS.APP]: AppReducer,
    [REDUCERS.AUTH]: AuthReducer,
    [REDUCERS.EDM]: EDMReducer,
    [REDUCERS.ORGS]: OrgsReducer,
    [REDUCERS.PERMISSIONS]: PermissionsReducer,
    [REDUCERS.USERS]: UsersReducer,
    router: connectRouter(routerHistory),
  });
}
