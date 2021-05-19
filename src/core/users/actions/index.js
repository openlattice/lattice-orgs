/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const RESET_USER_SEARCH_RESULTS :'RESET_USER_SEARCH_RESULTS' = 'RESET_USER_SEARCH_RESULTS';
const resetUserSearchResults = () => ({
  type: RESET_USER_SEARCH_RESULTS,
});

const SEARCH_ALL_USERS :'SEARCH_ALL_USERS' = 'SEARCH_ALL_USERS';
const searchAllUsers :RequestSequence = newRequestSequence(SEARCH_ALL_USERS);

export {
  RESET_USER_SEARCH_RESULTS,
  SEARCH_ALL_USERS,
  resetUserSearchResults,
  searchAllUsers,
};
