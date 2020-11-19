/*
 * @flow
 */

import { Map } from 'immutable';

import { ACCOUNT, ATLAS_CREDENTIALS } from '../constants';

export default function selectAtlasCredentials() {
  return (state :Map) :Map => state.getIn([ACCOUNT, ATLAS_CREDENTIALS]);
}
