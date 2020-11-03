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

const INITIALIZE_ORGANIZATION :'INITIALIZE_ORGANIZATION' = 'INITIALIZE_ORGANIZATION';
const initializeOrganization :RequestSequence = newRequestSequence(INITIALIZE_ORGANIZATION);

const REMOVE_ROLE_FROM_ORGANIZATION :'REMOVE_ROLE_FROM_ORGANIZATION' = 'REMOVE_ROLE_FROM_ORGANIZATION';
const removeRoleFromOrganization :RequestSequence = newRequestSequence(REMOVE_ROLE_FROM_ORGANIZATION);

const GET_SHIPROOM_METADATA :'GET_SHIPROOM_METADATA' = 'GET_SHIPROOM_METADATA';
const getShiproomMetadata :RequestSequence = newRequestSequence(GET_SHIPROOM_METADATA);

export {
  ADD_ROLE_TO_ORGANIZATION,
  CREATE_NEW_ORGANIZATION,
  GET_SHIPROOM_METADATA,
  INITIALIZE_ORGANIZATION,
  REMOVE_ROLE_FROM_ORGANIZATION,
  addRoleToOrganization,
  createNewOrganization,
  getShiproomMetadata,
  initializeOrganization,
  removeRoleFromOrganization,
};
