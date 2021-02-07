/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import {
  DataSetsApiActions,
  EntitySetsApiActions,
  OrganizationsApiActions,
  SearchApiActions,
} from 'lattice-sagas';

import destroyTransportedOrganizationEntitySetReducer from './destroyTransportedOrganizationEntitySetReducer';
import getEntityDataModelTypesReducer from './getEntityDataModelTypesReducer';
import getEntitySetReducer from './getEntitySetReducer';
import getEntitySetsReducer from './getEntitySetsReducer';
import getOrSelectDataSetReducer from './getOrSelectDataSetReducer';
import getOrSelectDataSetsReducer from './getOrSelectDataSetsReducer';
import getOrgDataSetColumnsFromMetaReducer from './getOrgDataSetColumnsFromMetaReducer';
import getOrgDataSetsFromMetaReducer from './getOrgDataSetsFromMetaReducer';
import getOrganizationDataSetSchemaReducer from './getOrganizationDataSetSchemaReducer';
import getOrganizationDataSetsReducer from './getOrganizationDataSetsReducer';
import initializeOrganizationDataSetReducer from './initializeOrganizationDataSetReducer';
import promoteStagingTableReducer from './promoteStagingTableReducer';
import searchEntitySetMetaDataReducer from './searchEntitySetMetaDataReducer';
import transportOrganizationEntitySetReducer from './transportOrganizationEntitySetReducer';
import updateDataSetMetaDataReducer from './updateDataSetMetaDataReducer';

import { RESET_REQUEST_STATE } from '../../redux/actions';
import {
  ATLAS_DATA_SETS,
  DATA_SET_SCHEMA,
  ENTITY_SETS,
  ENTITY_SETS_INDEX_MAP,
  ENTITY_TYPES,
  ENTITY_TYPES_INDEX_MAP,
  ORG_DATA_SETS,
  ORG_DATA_SET_COLUMNS,
  PROPERTY_TYPES,
  PROPERTY_TYPES_INDEX_MAP,
  RS_INITIAL_STATE,
} from '../../redux/constants';
import { resetRequestStateReducer } from '../../redux/reducers';
import {
  GET_EDM_TYPES,
  GET_ORG_DATA_SETS_FROM_META,
  GET_ORG_DATA_SET_COLUMNS_FROM_META,
  GET_OR_SELECT_DATA_SET,
  GET_OR_SELECT_DATA_SETS,
  INITIALIZE_ORGANIZATION_DATA_SET,
  UPDATE_DATA_SET_METADATA,
  getEntityDataModelTypes,
  getOrSelectDataSet,
  getOrSelectDataSets,
  getOrgDataSetColumnsFromMeta,
  getOrgDataSetsFromMeta,
  initializeOrganizationDataSet,
  updateDataSetMetaData,
} from '../actions';

const {
  GET_ORGANIZATION_DATA_SETS,
  GET_ORGANIZATION_DATA_SET_SCHEMA,
  getOrganizationDataSetSchema,
  getOrganizationDataSets,
} = DataSetsApiActions;

const {
  GET_ENTITY_SET,
  GET_ENTITY_SETS,
  getEntitySet,
  getEntitySets,
} = EntitySetsApiActions;

const {
  DESTROY_TRANSPORTED_ORGANIZATION_ENTITY_SET,
  PROMOTE_STAGING_TABLE,
  TRANSPORT_ORGANIZATION_ENTITY_SET,
  destroyTransportedOrganizationEntitySet,
  promoteStagingTable,
  transportOrganizationEntitySet,
} = OrganizationsApiActions;

const {
  SEARCH_ENTITY_SET_METADATA,
  searchEntitySetMetaData,
} = SearchApiActions;

const INITIAL_STATE :Map = fromJS({
  // actions
  [DESTROY_TRANSPORTED_ORGANIZATION_ENTITY_SET]: RS_INITIAL_STATE,
  [GET_EDM_TYPES]: RS_INITIAL_STATE,
  [GET_ENTITY_SETS]: RS_INITIAL_STATE,
  [GET_ENTITY_SET]: RS_INITIAL_STATE,
  [GET_ORGANIZATION_DATA_SETS]: RS_INITIAL_STATE,
  [GET_ORGANIZATION_DATA_SET_SCHEMA]: RS_INITIAL_STATE,
  [GET_ORG_DATA_SETS_FROM_META]: RS_INITIAL_STATE,
  [GET_ORG_DATA_SET_COLUMNS_FROM_META]: RS_INITIAL_STATE,
  [GET_OR_SELECT_DATA_SETS]: RS_INITIAL_STATE,
  [GET_OR_SELECT_DATA_SET]: RS_INITIAL_STATE,
  [INITIALIZE_ORGANIZATION_DATA_SET]: RS_INITIAL_STATE,
  [PROMOTE_STAGING_TABLE]: RS_INITIAL_STATE,
  [SEARCH_ENTITY_SET_METADATA]: RS_INITIAL_STATE,
  [TRANSPORT_ORGANIZATION_ENTITY_SET]: RS_INITIAL_STATE,
  [UPDATE_DATA_SET_METADATA]: RS_INITIAL_STATE,

  // data
  // TODO - remove ATLAS_DATA_SETS
  [ATLAS_DATA_SETS]: Map(),
  [DATA_SET_SCHEMA]: Map(),
  [ENTITY_SETS]: List(),
  [ENTITY_SETS_INDEX_MAP]: Map(),
  [ENTITY_TYPES]: List(),
  [ENTITY_TYPES_INDEX_MAP]: Map(),
  [ORG_DATA_SETS]: Map(),
  [ORG_DATA_SET_COLUMNS]: Map(),
  [PROPERTY_TYPES]: List(),
  [PROPERTY_TYPES_INDEX_MAP]: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATE:
      return resetRequestStateReducer(state, action);

    case destroyTransportedOrganizationEntitySet.case(action.type):
      return destroyTransportedOrganizationEntitySetReducer(state, action);

    case getEntityDataModelTypes.case(action.type):
      return getEntityDataModelTypesReducer(state, action);

    case getEntitySet.case(action.type):
      return getEntitySetReducer(state, action);

    case getEntitySets.case(action.type):
      return getEntitySetsReducer(state, action);

    case getOrSelectDataSet.case(action.type):
      return getOrSelectDataSetReducer(state, action);

    case getOrSelectDataSets.case(action.type):
      return getOrSelectDataSetsReducer(state, action);

    case getOrganizationDataSets.case(action.type):
      return getOrganizationDataSetsReducer(state, action);

    case getOrgDataSetColumnsFromMeta.case(action.type):
      return getOrgDataSetColumnsFromMetaReducer(state, action);

    case getOrgDataSetsFromMeta.case(action.type):
      return getOrgDataSetsFromMetaReducer(state, action);

    case getOrganizationDataSetSchema.case(action.type):
      return getOrganizationDataSetSchemaReducer(state, action);

    case initializeOrganizationDataSet.case(action.type):
      return initializeOrganizationDataSetReducer(state, action);

    case promoteStagingTable.case(action.type):
      return promoteStagingTableReducer(state, action);

    case searchEntitySetMetaData.case(action.type):
      return searchEntitySetMetaDataReducer(state, action);

    case transportOrganizationEntitySet.case(action.type):
      return transportOrganizationEntitySetReducer(state, action);

    case updateDataSetMetaData.case(action.type):
      return updateDataSetMetaDataReducer(state, action);

    default:
      return state;
  }
}
