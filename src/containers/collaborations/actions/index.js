/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_DATA_SETS_TO_COLLABORATION :'ADD_DATA_SETS_TO_COLLABORATION' = 'ADD_DATA_SETS_TO_COLLABORATION';
const addDataSetsToCollaboration :RequestSequence = newRequestSequence(ADD_DATA_SETS_TO_COLLABORATION);

const CREATE_NEW_COLLABORATION :'CREATE_NEW_COLLABORATION' = 'CREATE_NEW_COLLABORATION';
const createNewCollaboration :RequestSequence = newRequestSequence(CREATE_NEW_COLLABORATION);

const GET_DATA_SETS_IN_COLLABORATION :'GET_DATA_SETS_IN_COLLABORATION' = 'GET_DATA_SETS_IN_COLLABORATION';
const getDataSetsInCollaboration :RequestSequence = newRequestSequence(GET_DATA_SETS_IN_COLLABORATION);

export {
  ADD_DATA_SETS_TO_COLLABORATION,
  CREATE_NEW_COLLABORATION,
  GET_DATA_SETS_IN_COLLABORATION,
  addDataSetsToCollaboration,
  createNewCollaboration,
  getDataSetsInCollaboration,
};
