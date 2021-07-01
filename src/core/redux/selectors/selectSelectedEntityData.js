/*
 * @flow
 */

import { Map } from 'immutable';

import { EXPLORE, SELECTED_ENTITY_DATA } from '../constants';

export default function selectSelectedEntityData() {
  return (state :Map) :Map => (
    state.getIn([EXPLORE, SELECTED_ENTITY_DATA], Map())
  );
}
