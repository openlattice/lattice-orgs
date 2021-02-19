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
import getOrgDataSetColumnsFromMetaReducer from './getOrgDataSetColumnsFromMetaReducer';
import getOrgDataSetsFromMetaReducer from './getOrgDataSetsFromMetaReducer';
import getOrganizationDataSetSchemaReducer from './getOrganizationDataSetSchemaReducer';
import initializeOrganizationDataSetReducer from './initializeOrganizationDataSetReducer';
import promoteStagingTableReducer from './promoteStagingTableReducer';
import searchEntitySetMetaDataReducer from './searchEntitySetMetaDataReducer';
import transportOrganizationEntitySetReducer from './transportOrganizationEntitySetReducer';
import updateOrganizationDataSetReducer from './updateOrganizationDataSetReducer';

import { RESET_REQUEST_STATE } from '../../redux/actions';
import {
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
  INITIALIZE_ORGANIZATION_DATA_SET,
  UPDATE_ORGANIZATION_DATA_SET,
  getEntityDataModelTypes,
  getOrgDataSetColumnsFromMeta,
  getOrgDataSetsFromMeta,
  initializeOrganizationDataSet,
  updateOrganizationDataSet,
} from '../actions';

const {
  GET_ORGANIZATION_DATA_SET_SCHEMA,
  getOrganizationDataSetSchema,
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
  [GET_ORGANIZATION_DATA_SET_SCHEMA]: RS_INITIAL_STATE,
  [GET_ORG_DATA_SETS_FROM_META]: RS_INITIAL_STATE,
  [GET_ORG_DATA_SET_COLUMNS_FROM_META]: RS_INITIAL_STATE,
  [INITIALIZE_ORGANIZATION_DATA_SET]: RS_INITIAL_STATE,
  [PROMOTE_STAGING_TABLE]: RS_INITIAL_STATE,
  [SEARCH_ENTITY_SET_METADATA]: RS_INITIAL_STATE,
  [TRANSPORT_ORGANIZATION_ENTITY_SET]: RS_INITIAL_STATE,
  [UPDATE_ORGANIZATION_DATA_SET]: RS_INITIAL_STATE,

  // data
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

    case updateOrganizationDataSet.case(action.type):
      return updateOrganizationDataSetReducer(state, action);

    default:
      return state;
  }
}
