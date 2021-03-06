/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_EDM_TYPES :'GET_EDM_TYPES' = 'GET_EDM_TYPES';
const getEntityDataModelTypes :RequestSequence = newRequestSequence(GET_EDM_TYPES);

const GET_ORG_DATA_SETS_FROM_META :'GET_ORG_DATA_SETS_FROM_META' = 'GET_ORG_DATA_SETS_FROM_META';
const getOrgDataSetsFromMeta :RequestSequence = newRequestSequence(GET_ORG_DATA_SETS_FROM_META);

const GET_ORG_DATA_SET_COLUMNS_FROM_META :'GET_ORG_DATA_SET_COLUMNS_FROM_META' = 'GET_ORG_DATA_SET_COLUMNS_FROM_META';
const getOrgDataSetColumnsFromMeta :RequestSequence = newRequestSequence(GET_ORG_DATA_SET_COLUMNS_FROM_META);

const INITIALIZE_ORGANIZATION_DATA_SET :'INITIALIZE_ORGANIZATION_DATA_SET' = 'INITIALIZE_ORGANIZATION_DATA_SET';
const initializeOrganizationDataSet :RequestSequence = newRequestSequence(INITIALIZE_ORGANIZATION_DATA_SET);

const IS_APP_INSTALLED :'IS_APP_INSTALLED' = 'IS_APP_INSTALLED';
const isAppInstalled :RequestSequence = newRequestSequence(IS_APP_INSTALLED);

const UPDATE_ORGANIZATION_DATA_SET :'UPDATE_ORGANIZATION_DATA_SET' = 'UPDATE_ORGANIZATION_DATA_SET';
const updateOrganizationDataSet :RequestSequence = newRequestSequence(UPDATE_ORGANIZATION_DATA_SET);

export {
  GET_EDM_TYPES,
  GET_ORG_DATA_SETS_FROM_META,
  GET_ORG_DATA_SET_COLUMNS_FROM_META,
  INITIALIZE_ORGANIZATION_DATA_SET,
  IS_APP_INSTALLED,
  UPDATE_ORGANIZATION_DATA_SET,
  getEntityDataModelTypes,
  getOrgDataSetColumnsFromMeta,
  getOrgDataSetsFromMeta,
  initializeOrganizationDataSet,
  isAppInstalled,
  updateOrganizationDataSet,
};
