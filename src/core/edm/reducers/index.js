/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { DataSetsApiActions, EntitySetsApiActions } from 'lattice-sagas';

import getEntityDataModelTypesReducer from './getEntityDataModelTypesReducer';
import getEntitySetReducer from './getEntitySetReducer';
import getEntitySetsReducer from './getEntitySetsReducer';
import getOrSelectDataSetsReducer from './getOrSelectDataSetsReducer';
import getOrganizationDataSetsReducer from './getOrganizationDataSetsReducer';

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
  GET_OR_SELECT_DATA_SETS,
  getEntityDataModelTypes,
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

const INITIAL_STATE :Map = fromJS({
  // actions
  [GET_EDM_TYPES]: RS_INITIAL_STATE,
  [GET_ENTITY_SETS]: RS_INITIAL_STATE,
  [GET_ENTITY_SET]: RS_INITIAL_STATE,
  [GET_ORGANIZATION_DATA_SETS]: RS_INITIAL_STATE,
  [GET_OR_SELECT_DATA_SETS]: RS_INITIAL_STATE,
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

    case getOrSelectDataSets.case(action.type):
      return getOrSelectDataSetsReducer(state, action);

    case getOrganizationDataSets.case(action.type):
      return getOrganizationDataSetsReducer(state, action);

    default:
      return state;
  }
}
