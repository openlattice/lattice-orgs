/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_ORGANIZATION_DETAILS :'GET_ORGANIZATION_DETAILS' = 'GET_ORGANIZATION_DETAILS';
const getOrganizationDetails :RequestSequence = newRequestSequence(GET_ORGANIZATION_DETAILS);

const SEARCH_MEMBERS_TO_ADD_TO_ORG :'SEARCH_MEMBERS_TO_ADD_TO_ORG' = 'SEARCH_MEMBERS_TO_ADD_TO_ORG';
const searchMembersToAddToOrg :RequestSequence = newRequestSequence(SEARCH_MEMBERS_TO_ADD_TO_ORG);

export {
  GET_ORGANIZATION_DETAILS,
  SEARCH_MEMBERS_TO_ADD_TO_ORG,
  getOrganizationDetails,
  searchMembersToAddToOrg,
};
