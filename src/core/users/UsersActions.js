/*
 * @flow
 */

const RESET_USER_SEARCH_RESULTS :'RESET_USER_SEARCH_RESULTS' = 'RESET_USER_SEARCH_RESULTS';
const resetUserSearchResults = () => ({
  type: RESET_USER_SEARCH_RESULTS,
});

export {
  RESET_USER_SEARCH_RESULTS,
  resetUserSearchResults,
};
