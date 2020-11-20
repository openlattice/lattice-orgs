/*
 * @flow
 */

/* eslint-disable max-len */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_ROLE_TO_ORGANIZATION :'ADD_ROLE_TO_ORGANIZATION' = 'ADD_ROLE_TO_ORGANIZATION';
const addRoleToOrganization :RequestSequence = newRequestSequence(ADD_ROLE_TO_ORGANIZATION);

const CREATE_NEW_ORGANIZATION :'CREATE_NEW_ORGANIZATION' = 'CREATE_NEW_ORGANIZATION';
const createNewOrganization :RequestSequence = newRequestSequence(CREATE_NEW_ORGANIZATION);

const EDIT_METADATA :'EDIT_METADATA' = 'EDIT_METADATA';
const editMetadata :RequestSequence = newRequestSequence(EDIT_METADATA);

const EDIT_ORGANIZATION_DETAILS :'EDIT_ORGANIZATION_DETAILS' = 'EDIT_ORGANIZATION_DETAILS';
const editOrganizationDetails :RequestSequence = newRequestSequence(EDIT_ORGANIZATION_DETAILS);

const GET_ORGANIZATION_INTEGRATION_DETAILS :'GET_ORGANIZATION_INTEGRATION_DETAILS' = 'GET_ORGANIZATION_INTEGRATION_DETAILS';
const getOrganizationIntegrationDetails :RequestSequence = newRequestSequence(GET_ORGANIZATION_INTEGRATION_DETAILS);

const GET_SHIPROOM_METADATA :'GET_SHIPROOM_METADATA' = 'GET_SHIPROOM_METADATA';
const getShiproomMetadata :RequestSequence = newRequestSequence(GET_SHIPROOM_METADATA);

const INITIALIZE_ORGANIZATION :'INITIALIZE_ORGANIZATION' = 'INITIALIZE_ORGANIZATION';
const initializeOrganization :RequestSequence = newRequestSequence(INITIALIZE_ORGANIZATION);

const REMOVE_ROLE_FROM_ORGANIZATION :'REMOVE_ROLE_FROM_ORGANIZATION' = 'REMOVE_ROLE_FROM_ORGANIZATION';
const removeRoleFromOrganization :RequestSequence = newRequestSequence(REMOVE_ROLE_FROM_ORGANIZATION);

export {
  ADD_ROLE_TO_ORGANIZATION,
  CREATE_NEW_ORGANIZATION,
  EDIT_METADATA,
  EDIT_ORGANIZATION_DETAILS,
  GET_ORGANIZATION_INTEGRATION_DETAILS,
  GET_SHIPROOM_METADATA,
  INITIALIZE_ORGANIZATION,
  REMOVE_ROLE_FROM_ORGANIZATION,
  addRoleToOrganization,
  createNewOrganization,
  editMetadata,
  editOrganizationDetails,
  getOrganizationIntegrationDetails,
  getShiproomMetadata,
  initializeOrganization,
  removeRoleFromOrganization,
};
