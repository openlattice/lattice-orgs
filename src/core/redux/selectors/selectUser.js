/*
 * @flow
 */

import { Map, getIn } from 'immutable';

import { USERS } from '../constants';

export default function selectSearchTotalHits(userId :string) {

  return (state :Map) :Map => getIn(state, [USERS, USERS, userId]) || Map();
}
