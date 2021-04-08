/*
 * @flow
 */

import { Map } from 'immutable';

import { ATLAS_CREDENTIALS } from '../../../core/redux/constants';

export default function reducer(state :Map) {

  return state.set(ATLAS_CREDENTIALS, Map());
}
