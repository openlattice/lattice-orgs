/*
 * @flow
 */

import { Map, getIn } from 'immutable';

import { PAGE, SEARCH } from '../constants';

export default function selectSearchPage(action :string) {

  return (state :Map) :number => getIn(state, [SEARCH, action, PAGE]) || 1;
}
