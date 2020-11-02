/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { DataSetsApiActions, EntitySetsApiActions, SearchApiActions } from 'lattice-sagas';

import getEntityDataModelTypesReducer from './getEntityDataModelTypesReducer';
import getEntitySetReducer from './getEntitySetReducer';
import getEntitySetsReducer from './getEntitySetsReducer';
import getOrSelectDataSetReducer from './getOrSelectDataSetReducer';
import getOrSelectDataSetsReducer from './getOrSelectDataSetsReducer';
import getOrganizationDataSetsReducer from './getOrganizationDataSetsReducer';
import searchEntitySetMetaDataReducer from './searchEntitySetMetaDataReducer';

import {
  ATLAS_DATA_SETS,
  ENTITY_SETS,
  ENTITY_SETS_INDEX_MAP,
  ENTITY_TYPES,
  ENTITY_TYPES_INDEX_MAP,
  PROPERTY_TYPES,
  PROPERTY_TYPES_INDEX_MAP,
  RS_INITIAL_STATE,
} from '../../redux/constants';
import {
  GET_EDM_TYPES,
  GET_OR_SELECT_DATA_SET,
  GET_OR_SELECT_DATA_SETS,
  getEntityDataModelTypes,
  getOrSelectDataSet,
  getOrSelectDataSets,
} from '../actions';

const {
  GET_ORGANIZATION_DATA_SETS,
  getOrganizationDataSets,
} = DataSetsApiActions;

const {
  GET_ENTITY_SET,
  GET_ENTITY_SETS,
  getEntitySet,
  getEntitySets,
} = EntitySetsApiActions;

const {
  SEARCH_ENTITY_SET_METADATA,
  searchEntitySetMetaData,
} = SearchApiActions;

const INITIAL_STATE :Map = fromJS({
  // actions
  [GET_EDM_TYPES]: RS_INITIAL_STATE,
  [GET_ENTITY_SETS]: RS_INITIAL_STATE,
  [GET_ENTITY_SET]: RS_INITIAL_STATE,
  [GET_ORGANIZATION_DATA_SETS]: RS_INITIAL_STATE,
  [GET_OR_SELECT_DATA_SET]: RS_INITIAL_STATE,
  [GET_OR_SELECT_DATA_SETS]: RS_INITIAL_STATE,
  [SEARCH_ENTITY_SET_METADATA]: RS_INITIAL_STATE,
  // data
  [ATLAS_DATA_SETS]: Map(),
  [ENTITY_SETS]: List(),
  [ENTITY_SETS_INDEX_MAP]: Map(),
  [ENTITY_TYPES]: List(),
  [ENTITY_TYPES_INDEX_MAP]: Map(),
  [PROPERTY_TYPES]: List(),
  [PROPERTY_TYPES_INDEX_MAP]: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

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

    case searchEntitySetMetaData.case(action.type):
      return searchEntitySetMetaDataReducer(state, action);

    default:
      return state;
  }
}
