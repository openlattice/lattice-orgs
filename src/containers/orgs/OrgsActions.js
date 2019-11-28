/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_CONNECTION :'ADD_CONNECTION' = 'ADD_CONNECTION';
const addConnection :RequestSequence = newRequestSequence(ADD_CONNECTION);

const GET_ORGANIZATION_ACLS :'GET_ORGANIZATION_ACLS' = 'GET_ORGANIZATION_ACLS';
const getOrganizationACLs :RequestSequence = newRequestSequence(GET_ORGANIZATION_ACLS);

const GET_ORGANIZATION_DETAILS :'GET_ORGANIZATION_DETAILS' = 'GET_ORGANIZATION_DETAILS';
const getOrganizationDetails :RequestSequence = newRequestSequence(GET_ORGANIZATION_DETAILS);

const GET_ORGS_AND_PERMISSIONS :'GET_ORGS_AND_PERMISSIONS' = 'GET_ORGS_AND_PERMISSIONS';
const getOrgsAndPermissions :RequestSequence = newRequestSequence(GET_ORGS_AND_PERMISSIONS);

const REMOVE_CONNECTION :'REMOVE_CONNECTION' = 'REMOVE_CONNECTION';
const removeConnection :RequestSequence = newRequestSequence(REMOVE_CONNECTION);

export {
  ADD_CONNECTION,
  GET_ORGANIZATION_ACLS,
  GET_ORGANIZATION_DETAILS,
  GET_ORGS_AND_PERMISSIONS,
  REMOVE_CONNECTION,
  addConnection,
  getOrganizationACLs,
  getOrganizationDetails,
  getOrgsAndPermissions,
  removeConnection,
};
