/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CREATE_NEW_COLLABORATION :'CREATE_NEW_COLLABORATION' = 'CREATE_NEW_COLLABORATION';
const createNewCollaboration :RequestSequence = newRequestSequence(CREATE_NEW_COLLABORATION);

const GET_DATA_SETS_IN_COLLABORATION :'GET_DATA_SETS_IN_COLLABORATION' = 'GET_DATA_SETS_IN_COLLABORATION';
const getDataSetsInCollaboration :RequestSequence = newRequestSequence(GET_DATA_SETS_IN_COLLABORATION);

export {
  CREATE_NEW_COLLABORATION,
  GET_DATA_SETS_IN_COLLABORATION,
  createNewCollaboration,
  getDataSetsInCollaboration,
};
