/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_DATA_SET_METADATA :'GET_DATA_SET_METADATA' = 'GET_DATA_SET_METADATA';
const getDataSetMetaData :RequestSequence = newRequestSequence(GET_DATA_SET_METADATA);

const GET_EDM_TYPES :'GET_EDM_TYPES' = 'GET_EDM_TYPES';
const getEntityDataModelTypes :RequestSequence = newRequestSequence(GET_EDM_TYPES);

const GET_OR_SELECT_DATA_SET :'GET_OR_SELECT_DATA_SET' = 'GET_OR_SELECT_DATA_SET';
const getOrSelectDataSet :RequestSequence = newRequestSequence(GET_OR_SELECT_DATA_SET);

const GET_OR_SELECT_DATA_SETS :'GET_OR_SELECT_DATA_SETS' = 'GET_OR_SELECT_DATA_SETS';
const getOrSelectDataSets :RequestSequence = newRequestSequence(GET_OR_SELECT_DATA_SETS);

const UPDATE_DATA_SET_METADATA :'UPDATE_DATA_SET_METADATA' = 'UPDATE_DATA_SET_METADATA';
const updateDataSetMetaData :RequestSequence = newRequestSequence(UPDATE_DATA_SET_METADATA);

export {
  GET_DATA_SET_METADATA,
  GET_EDM_TYPES,
  GET_OR_SELECT_DATA_SET,
  GET_OR_SELECT_DATA_SETS,
  UPDATE_DATA_SET_METADATA,
  getDataSetMetaData,
  getEntityDataModelTypes,
  getOrSelectDataSet,
  getOrSelectDataSets,
  updateDataSetMetaData,
};
