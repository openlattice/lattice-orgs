/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
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
  HITS,
  MEMBERS,
  ORGANIZATIONS,
  ORGS,
  PAGE,
  PERMISSIONS,
  PROPERTY_TYPES,
  PROPERTY_TYPES_INDEX_MAP,
  QUERY,
  REQUEST_STATE,
  SEARCH,
  TOTAL_HITS,
  USERS,
} = ReduxConstants;

export const ACES :'aces' = 'aces';
export const ATLAS_DATA_SETS :'atlasDataSets' = 'atlasDataSets';
export const ATLAS_DATA_SET_IDS :'atlasDataSetIds' = 'atlasDataSetIds';
export const ENTITY_SET_IDS :'entitySetIds' = 'entitySetIds';
export const INTEGRATION_ACCOUNTS :'integrationAccounts' = 'integrationAccounts';
export const IS_OWNER :'isOwner' = 'isOwner';
export const USER_SEARCH_RESULTS :'userSearchResults' = 'userSearchResults';

// TODO: does this belong here?
export const INITIAL_SEARCH_RESULTS :Map = fromJS({ initial: true });

// TODO: does this belong here?
export const RS_INITIAL_STATE = {
  [ERROR]: false,
  [REQUEST_STATE]: RequestStates.STANDBY,
};

// TODO: does this belong here?
export const SEARCH_INITIAL_STATE = {
  [ERROR]: false,
  [HITS]: List(),
  [PAGE]: 0,
  [QUERY]: '',
  [REQUEST_STATE]: RequestStates.STANDBY,
  [TOTAL_HITS]: 0,
};
