/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_EDM_TYPES :'GET_EDM_TYPES' = 'GET_EDM_TYPES';
const getEntityDataModelTypes :RequestSequence = newRequestSequence(GET_EDM_TYPES);

const GET_OR_SELECT_DATA_SET :'GET_OR_SELECT_DATA_SET' = 'GET_OR_SELECT_DATA_SET';
const getOrSelectDataSet :RequestSequence = newRequestSequence(GET_OR_SELECT_DATA_SET);

const GET_OR_SELECT_DATA_SETS :'GET_OR_SELECT_DATA_SETS' = 'GET_OR_SELECT_DATA_SETS';
const getOrSelectDataSets :RequestSequence = newRequestSequence(GET_OR_SELECT_DATA_SETS);

const GET_ORG_DATA_SETS_FROM_META :'GET_ORG_DATA_SETS_FROM_META' = 'GET_ORG_DATA_SETS_FROM_META';
const getOrgDataSetsFromMeta :RequestSequence = newRequestSequence(GET_ORG_DATA_SETS_FROM_META);

const GET_ORG_DATA_SET_COLUMNS_FROM_META :'GET_ORG_DATA_SET_COLUMNS_FROM_META' = 'GET_ORG_DATA_SET_COLUMNS_FROM_META';
const getOrgDataSetColumnsFromMeta :RequestSequence = newRequestSequence(GET_ORG_DATA_SET_COLUMNS_FROM_META);

const INITIALIZE_ORGANIZATION_DATA_SET :'INITIALIZE_ORGANIZATION_DATA_SET' = 'INITIALIZE_ORGANIZATION_DATA_SET';
const initializeOrganizationDataSet :RequestSequence = newRequestSequence(INITIALIZE_ORGANIZATION_DATA_SET);

const UPDATE_DATA_SET_METADATA :'UPDATE_DATA_SET_METADATA' = 'UPDATE_DATA_SET_METADATA';
const updateDataSetMetaData :RequestSequence = newRequestSequence(UPDATE_DATA_SET_METADATA);

export {
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
};
