/*
 * @flow
 */

/* eslint-disable max-len */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_DATA_SET_ACCESS_REQUESTS :'GET_DATA_SET_ACCESS_REQUESTS' = 'GET_DATA_SET_ACCESS_REQUESTS';
const getDataSetAccessRequests :RequestSequence = newRequestSequence(GET_DATA_SET_ACCESS_REQUESTS);

const INITIALIZE_DATA_SET_ACCESS_REQUEST :'INITIALIZE_DATA_SET_ACCESS_REQUEST' = 'INITIALIZE_DATA_SET_ACCESS_REQUEST';
const initializeDataSetAccessRequest :RequestSequence = newRequestSequence(INITIALIZE_DATA_SET_ACCESS_REQUEST);

const SUBMIT_DATA_SET_ACCESS_REQUEST :'SUBMIT_DATA_SET_ACCESS_REQUEST' = 'SUBMIT_DATA_SET_ACCESS_REQUEST';
const submitDataSetAccessRequest :RequestSequence = newRequestSequence(SUBMIT_DATA_SET_ACCESS_REQUEST);

export {
  GET_DATA_SET_ACCESS_REQUESTS,
  INITIALIZE_DATA_SET_ACCESS_REQUEST,
  SUBMIT_DATA_SET_ACCESS_REQUEST,
  getDataSetAccessRequests,
  initializeDataSetAccessRequest,
  submitDataSetAccessRequest,
};
