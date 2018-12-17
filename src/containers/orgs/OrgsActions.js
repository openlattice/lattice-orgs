/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const GET_RELEVANT_ENTITY_SETS :'GET_RELEVANT_ENTITY_SETS' = 'GET_RELEVANT_ENTITY_SETS';
const getRelevantEntitySets :RequestSequence = newRequestSequence(GET_RELEVANT_ENTITY_SETS);

const SWITCH_ORGANIZATION :'SWITCH_ORGANIZATION' = 'SWITCH_ORGANIZATION';
const switchOrganization = (orgId :UUID) :Object => ({
  orgId,
  type: SWITCH_ORGANIZATION
});

export {
  GET_RELEVANT_ENTITY_SETS,
  SWITCH_ORGANIZATION,
  getRelevantEntitySets,
  switchOrganization,
};
