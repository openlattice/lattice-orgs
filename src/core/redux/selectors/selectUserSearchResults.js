/*
 * @flow
 */

import { Map, getIn } from 'immutable';

import { USERS, USER_SEARCH_RESULTS } from '../constants';

export default function selectUserSearchResults() {

  return (state :Map) :Map<string, Map> => getIn(state, [USERS, USER_SEARCH_RESULTS]) || Map();
}
