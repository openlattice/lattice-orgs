/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { EntitySetsApiActions } from 'lattice-sagas';

import getEntityDataModelTypesReducer from './getEntityDataModelTypesReducer';
import getEntitySetReducer from './getEntitySetReducer';
import getEntitySetsReducer from './getEntitySetsReducer';
import getOrSelectEntitySetsReducer from './getOrSelectEntitySetsReducer';

import {
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
  GET_OR_SELECT_ENTITY_SETS,
  getEntityDataModelTypes,
  getOrSelectEntitySets,
} from '../actions';

const {
  GET_ENTITY_SET,
  GET_ENTITY_SETS,
  getEntitySet,
  getEntitySets,
} = EntitySetsApiActions;

const INITIAL_STATE :Map = fromJS({
  // actions
  [GET_EDM_TYPES]: RS_INITIAL_STATE,
  [GET_ENTITY_SET]: RS_INITIAL_STATE,
  [GET_ENTITY_SETS]: RS_INITIAL_STATE,
  [GET_OR_SELECT_ENTITY_SETS]: RS_INITIAL_STATE,
  // data
  [ENTITY_SETS]: List(),
  [ENTITY_SETS_INDEX_MAP]: Map(),
  [ENTITY_TYPES]: List(),
  [ENTITY_TYPES_INDEX_MAP]: Map(),
  [PROPERTY_TYPES]: List(),
  [PROPERTY_TYPES_INDEX_MAP]: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  if (action.type === getEntityDataModelTypes.case(action.type)) {
    return getEntityDataModelTypesReducer(state, action);
  }

  if (action.type === getEntitySet.case(action.type)) {
    return getEntitySetReducer(state, action);
  }

  if (action.type === getEntitySets.case(action.type)) {
    return getEntitySetsReducer(state, action);
  }

  if (action.type === getOrSelectEntitySets.case(action.type)) {
    return getOrSelectEntitySetsReducer(state, action);
  }

  return state;
}
