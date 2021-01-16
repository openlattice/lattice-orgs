/*
 * @flow
 */

/* eslint-disable max-len */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const INITIALIZE_DATA_SET_ACCESS_REQUEST :'INITIALIZE_DATA_SET_ACCESS_REQUEST' = 'INITIALIZE_DATA_SET_ACCESS_REQUEST';
const initializeDataSetAccessRequest :RequestSequence = newRequestSequence(INITIALIZE_DATA_SET_ACCESS_REQUEST);

export {
  INITIALIZE_DATA_SET_ACCESS_REQUEST,
  initializeDataSetAccessRequest,
};
