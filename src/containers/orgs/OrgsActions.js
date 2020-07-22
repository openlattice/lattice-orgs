/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_CONNECTION :'ADD_CONNECTION' = 'ADD_CONNECTION';
const addConnection :RequestSequence = newRequestSequence(ADD_CONNECTION);

const ADD_ROLE_TO_ORGANIZATION :'ADD_ROLE_TO_ORGANIZATION' = 'ADD_ROLE_TO_ORGANIZATION';
const addRoleToOrganization :RequestSequence = newRequestSequence(ADD_ROLE_TO_ORGANIZATION);

const GET_ORGANIZATION_ACLS :'GET_ORGANIZATION_ACLS' = 'GET_ORGANIZATION_ACLS';
const getOrganizationACLs :RequestSequence = newRequestSequence(GET_ORGANIZATION_ACLS);

const GET_ORGANIZATION_DETAILS :'GET_ORGANIZATION_DETAILS' = 'GET_ORGANIZATION_DETAILS';
const getOrganizationDetails :RequestSequence = newRequestSequence(GET_ORGANIZATION_DETAILS);

const GET_ORGS_AND_PERMISSIONS :'GET_ORGS_AND_PERMISSIONS' = 'GET_ORGS_AND_PERMISSIONS';
const getOrgsAndPermissions :RequestSequence = newRequestSequence(GET_ORGS_AND_PERMISSIONS);

const REMOVE_CONNECTION :'REMOVE_CONNECTION' = 'REMOVE_CONNECTION';
const removeConnection :RequestSequence = newRequestSequence(REMOVE_CONNECTION);

const REMOVE_ROLE_FROM_ORGANIZATION :'REMOVE_ROLE_FROM_ORGANIZATION' = 'REMOVE_ROLE_FROM_ORGANIZATION';
const removeRoleFromOrganization :RequestSequence = newRequestSequence(REMOVE_ROLE_FROM_ORGANIZATION);

export {
  ADD_CONNECTION,
  ADD_ROLE_TO_ORGANIZATION,
  GET_ORGANIZATION_ACLS,
  GET_ORGANIZATION_DETAILS,
  GET_ORGS_AND_PERMISSIONS,
  REMOVE_CONNECTION,
  REMOVE_ROLE_FROM_ORGANIZATION,
  addConnection,
  addRoleToOrganization,
  getOrganizationACLs,
  getOrganizationDetails,
  getOrgsAndPermissions,
  removeConnection,
  removeRoleFromOrganization,
};
