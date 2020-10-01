/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_EDM_TYPES :'GET_EDM_TYPES' = 'GET_EDM_TYPES';
const getEntityDataModelTypes :RequestSequence = newRequestSequence(GET_EDM_TYPES);

const GET_OR_SELECT_DATA_SETS :'GET_OR_SELECT_DATA_SETS' = 'GET_OR_SELECT_DATA_SETS';
const getOrSelectDataSets :RequestSequence = newRequestSequence(GET_OR_SELECT_DATA_SETS);

export {
  GET_EDM_TYPES,
  GET_OR_SELECT_DATA_SETS,
  getEntityDataModelTypes,
  getOrSelectDataSets,
};
