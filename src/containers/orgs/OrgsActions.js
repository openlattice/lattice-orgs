/*
 * @flow
 */

/* eslint-disable max-len */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_ROLE_TO_ORGANIZATION :'ADD_ROLE_TO_ORGANIZATION' = 'ADD_ROLE_TO_ORGANIZATION';
const addRoleToOrganization :RequestSequence = newRequestSequence(ADD_ROLE_TO_ORGANIZATION);

const INITIALIZE_ORGANIZATION :'INITIALIZE_ORGANIZATION' = 'INITIALIZE_ORGANIZATION';
const initializeOrganization :RequestSequence = newRequestSequence(INITIALIZE_ORGANIZATION);

const GET_ORGANIZATIONS_AND_AUTHORIZATIONS :'GET_ORGANIZATIONS_AND_AUTHORIZATIONS' = 'GET_ORGANIZATIONS_AND_AUTHORIZATIONS';
const getOrganizationsAndAuthorizations :RequestSequence = newRequestSequence(GET_ORGANIZATIONS_AND_AUTHORIZATIONS);

const REMOVE_ROLE_FROM_ORGANIZATION :'REMOVE_ROLE_FROM_ORGANIZATION' = 'REMOVE_ROLE_FROM_ORGANIZATION';
const removeRoleFromOrganization :RequestSequence = newRequestSequence(REMOVE_ROLE_FROM_ORGANIZATION);

export {
  ADD_ROLE_TO_ORGANIZATION,
  GET_ORGANIZATIONS_AND_AUTHORIZATIONS,
  INITIALIZE_ORGANIZATION,
  REMOVE_ROLE_FROM_ORGANIZATION,
  addRoleToOrganization,
  getOrganizationsAndAuthorizations,
  initializeOrganization,
  removeRoleFromOrganization,
};
