/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';

const { EDM, REQUEST_STATE } = ReduxConstants;

const APP :'app' = 'app';
const AUTH :'auth' = 'auth';
const DATA :'data' = 'data';
const ORGS :'orgs' = 'orgs';
const PERMISSIONS :'permissions' = 'permissions';
const USERS :'users' = 'users';

const REDUCERS = {
  APP,
  AUTH,
  DATA,
  EDM,
  ORGS,
  PERMISSIONS,
  USERS,
};

export {
  REDUCERS,
};

export const ENTITY_SETS :'entitySets' = 'entitySets';
export const ERROR :'error' = 'error';
export const IS_OWNER :'isOwner' = 'isOwner';
export const MEMBERS :'members' = 'members';
export const ORGANIZATIONS :'organizations' = 'organizations';

// TODO: does this belong here?
export const INITIAL_SEARCH_RESULTS :Map = fromJS({ initial: true });

// TODO: does this belong here?
export const RS_INITIAL_STATE = {
  [ERROR]: false,
  [REQUEST_STATE]: RequestStates.STANDBY,
};
