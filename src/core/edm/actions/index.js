/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_EDM_TYPES :'GET_EDM_TYPES' = 'GET_EDM_TYPES';
const getEntityDataModelTypes :RequestSequence = newRequestSequence(GET_EDM_TYPES);

const GET_ORG_DATA_SET_SIZE :'GET_ORG_DATA_SET_SIZE' = 'GET_ORG_DATA_SET_SIZE';
const getOrgDataSetSize :RequestSequence = newRequestSequence(GET_ORG_DATA_SET_SIZE);

const INITIALIZE_ORGANIZATION_DATA_SET :'INITIALIZE_ORGANIZATION_DATA_SET' = 'INITIALIZE_ORGANIZATION_DATA_SET';
const initializeOrganizationDataSet :RequestSequence = newRequestSequence(INITIALIZE_ORGANIZATION_DATA_SET);

const IS_APP_INSTALLED :'IS_APP_INSTALLED' = 'IS_APP_INSTALLED';
const isAppInstalled :RequestSequence = newRequestSequence(IS_APP_INSTALLED);

const UPDATE_ORGANIZATION_DATA_SET :'UPDATE_ORGANIZATION_DATA_SET' = 'UPDATE_ORGANIZATION_DATA_SET';
const updateOrganizationDataSet :RequestSequence = newRequestSequence(UPDATE_ORGANIZATION_DATA_SET);

export {
  GET_EDM_TYPES,
  GET_ORG_DATA_SET_SIZE,
  INITIALIZE_ORGANIZATION_DATA_SET,
  IS_APP_INSTALLED,
  UPDATE_ORGANIZATION_DATA_SET,
  getEntityDataModelTypes,
  getOrgDataSetSize,
  initializeOrganizationDataSet,
  isAppInstalled,
  updateOrganizationDataSet,
};
