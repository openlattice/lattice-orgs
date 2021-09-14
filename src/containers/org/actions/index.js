/*
 * @flow
 */

/* eslint-disable max-len */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_ROLE_TO_ORGANIZATION :'ADD_ROLE_TO_ORGANIZATION' = 'ADD_ROLE_TO_ORGANIZATION';
const addRoleToOrganization :RequestSequence = newRequestSequence(ADD_ROLE_TO_ORGANIZATION);

const ADD_MEMBERS_TO_ORGANIZATION :'ADD_MEMBERS_TO_ORGANIZATION' = 'ADD_MEMBERS_TO_ORGANIZATION';
const addMembersToOrganization :RequestSequence = newRequestSequence(ADD_MEMBERS_TO_ORGANIZATION);

const ASSIGN_ROLES_TO_MEMBERS :'ASSIGN_ROLES_TO_MEMBERS' = 'ASSIGN_ROLES_TO_MEMBERS';
const assignRolesToMembers :RequestSequence = newRequestSequence(ASSIGN_ROLES_TO_MEMBERS);

const CREATE_NEW_ORGANIZATION :'CREATE_NEW_ORGANIZATION' = 'CREATE_NEW_ORGANIZATION';
const createNewOrganization :RequestSequence = newRequestSequence(CREATE_NEW_ORGANIZATION);

const DELETE_EXISTING_ORGANIZATION :'DELETE_EXISTING_ORGANIZATION' = 'DELETE_EXISTING_ORGANIZATION';
const deleteExistingOrganization :RequestSequence = newRequestSequence(DELETE_EXISTING_ORGANIZATION);

const EDIT_ORGANIZATION_DETAILS :'EDIT_ORGANIZATION_DETAILS' = 'EDIT_ORGANIZATION_DETAILS';
const editOrganizationDetails :RequestSequence = newRequestSequence(EDIT_ORGANIZATION_DETAILS);

const EDIT_ROLE_DETAILS :'EDIT_ROLE_DETAILS' = 'EDIT_ROLE_DETAILS';
const editRoleDetails :RequestSequence = newRequestSequence(EDIT_ROLE_DETAILS);

const GET_ORGANIZATION_INTEGRATION_DETAILS :'GET_ORGANIZATION_INTEGRATION_DETAILS' = 'GET_ORGANIZATION_INTEGRATION_DETAILS';
const getOrganizationIntegrationDetails :RequestSequence = newRequestSequence(GET_ORGANIZATION_INTEGRATION_DETAILS);

const INITIALIZE_ORGANIZATION :'INITIALIZE_ORGANIZATION' = 'INITIALIZE_ORGANIZATION';
const initializeOrganization :RequestSequence = newRequestSequence(INITIALIZE_ORGANIZATION);

const REMOVE_ROLE_FROM_ORGANIZATION :'REMOVE_ROLE_FROM_ORGANIZATION' = 'REMOVE_ROLE_FROM_ORGANIZATION';
const removeRoleFromOrganization :RequestSequence = newRequestSequence(REMOVE_ROLE_FROM_ORGANIZATION);

const SET_PUBLIC_VISIBILITY :'SET_PUBLIC_VISIBILITY' = 'SET_PUBLIC_VISIBILITY';
const setPublicVisibility :RequestSequence = newRequestSequence(SET_PUBLIC_VISIBILITY);

const REMOVE_PUBLIC_VISIBILITY :'REMOVE_PUBLIC_VISIBILITY' = 'REMOVE_PUBLIC_VISIBILITY';
const removePublicVisibility :RequestSequence = newRequestSequence(REMOVE_PUBLIC_VISIBILITY);

export {
  ADD_MEMBERS_TO_ORGANIZATION,
  ADD_ROLE_TO_ORGANIZATION,
  ASSIGN_ROLES_TO_MEMBERS,
  CREATE_NEW_ORGANIZATION,
  DELETE_EXISTING_ORGANIZATION,
  EDIT_ORGANIZATION_DETAILS,
  EDIT_ROLE_DETAILS,
  GET_ORGANIZATION_INTEGRATION_DETAILS,
  INITIALIZE_ORGANIZATION,
  REMOVE_PUBLIC_VISIBILITY,
  REMOVE_ROLE_FROM_ORGANIZATION,
  SET_PUBLIC_VISIBILITY,
  addMembersToOrganization,
  addRoleToOrganization,
  assignRolesToMembers,
  createNewOrganization,
  deleteExistingOrganization,
  editOrganizationDetails,
  editRoleDetails,
  getOrganizationIntegrationDetails,
  initializeOrganization,
  removePublicVisibility,
  removeRoleFromOrganization,
  setPublicVisibility,
};
