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

/* eslint-disable-next-line max-len */
const CLEAR_COLLABORATIONS_BY_DATA_SET_ID :'CLEAR_COLLABORATIONS_BY_DATA_SET_ID' = 'CLEAR_COLLABORATIONS_BY_DATA_SET_ID';
const clearCollaborationsByDataSetId = () => ({
  type: CLEAR_COLLABORATIONS_BY_DATA_SET_ID
});

const CLEAR_COLLABORATION_DATA_SETS :'CLEAR_COLLABORATION_DATA_SETS' = 'CLEAR_COLLABORATION_DATA_SETS';
const clearCollaborationDataSets = () => ({
  type: CLEAR_COLLABORATION_DATA_SETS
});

const CLEAR_COLLABORATIONS :'CLEAR_COLLABORATIONS' = 'CLEAR_COLLABORATIONS';
const clearCollaborations = () => ({
  type: CLEAR_COLLABORATIONS
});

export {
  ADD_DATA_SETS_TO_COLLABORATION,
  CLEAR_COLLABORATIONS,
  CLEAR_COLLABORATIONS_BY_DATA_SET_ID,
  CLEAR_COLLABORATION_DATA_SETS,
  CREATE_NEW_COLLABORATION,
  GET_DATA_SETS_IN_COLLABORATION,
  addDataSetsToCollaboration,
  clearCollaborationDataSets,
  clearCollaborations,
  clearCollaborationsByDataSetId,
  createNewCollaboration,
  getDataSetsInCollaboration,
};
