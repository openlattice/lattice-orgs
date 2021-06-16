/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CREATE_NEW_COLLABORATION :'CREATE_NEW_COLLABORATION' = 'CREATE_NEW_COLLABORATION';
const createNewCollaboration :RequestSequence = newRequestSequence(CREATE_NEW_COLLABORATION);

export {
  CREATE_NEW_COLLABORATION,
  createNewCollaboration,
};
