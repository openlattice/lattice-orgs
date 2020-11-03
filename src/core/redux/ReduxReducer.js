/*
 * @flow
 */

import { connectRouter } from 'connected-react-router/immutable';
import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import {
  APP,
  AUTH,
  EDM,
  ORGANIZATIONS,
  PERMISSIONS,
  SEARCH,
  SHIPROOM,
  USERS,
} from './constants';

import { AppReducer } from '../../containers/app';
import { getShiproomMetadataReducer } from '../../containers/org/reducers';
import { OrgsReducer } from '../../containers/orgs';
import { EDMReducer } from '../edm';
import { PermissionsReducer } from '../permissions';
import { SearchReducer } from '../search';
import { UsersReducer } from '../users';

export default function reduxReducer(routerHistory :any) {

  return combineReducers({
    [APP]: AppReducer,
    [AUTH]: AuthReducer,
    [EDM]: EDMReducer,
    [ORGANIZATIONS]: OrgsReducer,
    [PERMISSIONS]: PermissionsReducer,
    [SEARCH]: SearchReducer,
    [SHIPROOM]: getShiproomMetadataReducer,
    [USERS]: UsersReducer,
    router: connectRouter(routerHistory),
  });
}
