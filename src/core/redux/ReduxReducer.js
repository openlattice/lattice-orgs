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
  SHIPROOM,
  USERS,
} from './constants';

import { AccountReducer } from '../../containers/account';
import { AppReducer } from '../../containers/app';
import { ShiproomReducer } from '../../containers/org/reducers';
import { OrgsReducer } from '../../containers/orgs';
import { EDMReducer } from '../edm';
import { PermissionsReducer } from '../permissions';
import { SearchReducer } from '../search';
import { UsersReducer } from '../users';

export default function reduxReducer(routerHistory :any) {

  return combineReducers({
    [ACCOUNT]: AccountReducer,
    [APP]: AppReducer,
    [AUTH]: AuthReducer,
    [EDM]: EDMReducer,
    [ORGANIZATIONS]: OrgsReducer,
    [PERMISSIONS]: PermissionsReducer,
    [SEARCH]: SearchReducer,
    [SHIPROOM]: ShiproomReducer,
    [USERS]: UsersReducer,
    router: connectRouter(routerHistory),
  });
}
