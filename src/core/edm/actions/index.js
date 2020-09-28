/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_EDM_TYPES :'GET_EDM_TYPES' = 'GET_EDM_TYPES';
const getEntityDataModelTypes :RequestSequence = newRequestSequence(GET_EDM_TYPES);

const GET_OR_SELECT_ENTITY_SETS :'GET_OR_SELECT_ENTITY_SETS' = 'GET_OR_SELECT_ENTITY_SETS';
const getOrSelectEntitySets :RequestSequence = newRequestSequence(GET_OR_SELECT_ENTITY_SETS);

export {
  GET_EDM_TYPES,
  GET_OR_SELECT_ENTITY_SETS,
  getEntityDataModelTypes,
  getOrSelectEntitySets,
};
