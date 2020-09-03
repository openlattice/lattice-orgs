/*
 * @flow
 */

/* eslint-disable max-len */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_ORGANIZATIONS_AND_AUTHORIZATIONS :'GET_ORGANIZATIONS_AND_AUTHORIZATIONS' = 'GET_ORGANIZATIONS_AND_AUTHORIZATIONS';
const getOrganizationsAndAuthorizations :RequestSequence = newRequestSequence(GET_ORGANIZATIONS_AND_AUTHORIZATIONS);

export {
  GET_ORGANIZATIONS_AND_AUTHORIZATIONS,
  getOrganizationsAndAuthorizations,
};
