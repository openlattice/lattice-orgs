/*
 * @flow
 */

import { List, Map, getIn } from 'immutable';
import type { Ace, UUID } from 'lattice';

import { ACES, PERMISSIONS } from '../constants';

const EMPTY_LIST = List();

export default function selectObjectPermissions(key :List<UUID>) {

  return (state :Map) :List<Ace> => getIn(state, [PERMISSIONS, ACES, key], EMPTY_LIST);
}
