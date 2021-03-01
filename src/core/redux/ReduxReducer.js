/*
 * @flow
 */

import { connectRouter } from 'connected-react-router/immutable';
import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import {
  ACCOUNT,
  APP,
  AUTH,
  EDM,
  ORGANIZATIONS,
  PERMISSIONS,
  SEARCH,
  USERS,
} from './constants';

import AccountReducer from '../../containers/account/reducers';
import AppReducer from '../../containers/app/reducers';
import EDMReducer from '../edm/reducers';
import OrgsReducer from '../../containers/org/reducers';
import PermissionsReducer from '../permissions/reducers';
import SearchReducer from '../search/reducers';
import UsersReducer from '../users/reducers';

export default function reduxReducer(routerHistory :any) {

  return combineReducers({
    [ACCOUNT]: AccountReducer,
    [APP]: AppReducer,
    [AUTH]: AuthReducer,
    [EDM]: EDMReducer,
    [ORGANIZATIONS]: OrgsReducer,
    [PERMISSIONS]: PermissionsReducer,
    [SEARCH]: SearchReducer,
    [USERS]: UsersReducer,
    router: connectRouter(routerHistory),
  });
}
