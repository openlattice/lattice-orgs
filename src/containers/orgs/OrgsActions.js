/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_ORGANIZATION_ACLS :'GET_ORGANIZATION_ACLS' = 'GET_ORGANIZATION_ACLS';
const getOrganizationACLs :RequestSequence = newRequestSequence(GET_ORGANIZATION_ACLS);

const GET_ORGANIZATION_DETAILS :'GET_ORGANIZATION_DETAILS' = 'GET_ORGANIZATION_DETAILS';
const getOrganizationDetails :RequestSequence = newRequestSequence(GET_ORGANIZATION_DETAILS);

const GET_ORGS_AND_PERMISSIONS :'GET_ORGS_AND_PERMISSIONS' = 'GET_ORGS_AND_PERMISSIONS';
const getOrgsAndPermissions :RequestSequence = newRequestSequence(GET_ORGS_AND_PERMISSIONS);

const SEARCH_MEMBERS_TO_ADD_TO_ORG :'SEARCH_MEMBERS_TO_ADD_TO_ORG' = 'SEARCH_MEMBERS_TO_ADD_TO_ORG';
const searchMembersToAddToOrg :RequestSequence = newRequestSequence(SEARCH_MEMBERS_TO_ADD_TO_ORG);

export {
  GET_ORGANIZATION_ACLS,
  GET_ORGANIZATION_DETAILS,
  GET_ORGS_AND_PERMISSIONS,
  SEARCH_MEMBERS_TO_ADD_TO_ORG,
  getOrganizationACLs,
  getOrganizationDetails,
  getOrgsAndPermissions,
  searchMembersToAddToOrg,
};
