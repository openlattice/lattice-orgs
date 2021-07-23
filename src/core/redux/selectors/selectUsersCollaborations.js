/*
 * @flow
 */

import { Map, getIn } from 'immutable';
import type { UUID } from 'lattice';

import { COLLABORATIONS } from '../constants';

export default function selectUsersCollaborations() {

  return (state :Map) :Map<UUID, Map> => getIn(state, [COLLABORATIONS, COLLABORATIONS]) || Map();
}
