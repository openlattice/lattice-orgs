/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';

export const {
  APP,
  AUTH,
  DATA,
  EDM,
  ENTITY_SETS,
  ENTITY_SETS_INDEX_MAP,
  ENTITY_TYPES,
  ENTITY_TYPES_INDEX_MAP,
  ERROR,
  MEMBERS,
  ORGANIZATIONS,
  ORGS,
  PERMISSIONS,
  PROPERTY_TYPES,
  PROPERTY_TYPES_INDEX_MAP,
  REQUEST_STATE,
  USERS,
} = ReduxConstants;

export const INTEGRATION_ACCOUNTS :'integrationAccounts' = 'integrationAccounts';
export const IS_OWNER :'isOwner' = 'isOwner';

// TODO: does this belong here?
export const INITIAL_SEARCH_RESULTS :Map = fromJS({ initial: true });

// TODO: does this belong here?
export const RS_INITIAL_STATE = {
  [ERROR]: false,
  [REQUEST_STATE]: RequestStates.STANDBY,
};
