/*
 * @flow
 */

const CLEAR_ATLAS_CREDENTIALS :'CLEAR_ATLAS_CREDENTIALS' = 'CLEAR_ATLAS_CREDENTIALS';
const clearAtlasCredentials = () => ({ type: CLEAR_ATLAS_CREDENTIALS });

export {
  CLEAR_ATLAS_CREDENTIALS,
  clearAtlasCredentials,
};
