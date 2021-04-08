/*
 * @flow
 */

import {
  List,
  Map,
  Set,
  getIn,
} from 'immutable';
import type { UUID } from 'lattice';

import { MY_KEYS, PERMISSIONS } from '../constants';

export default function selectMyKeys() {

  return (state :Map) :Set<List<UUID>> => getIn(state, [PERMISSIONS, MY_KEYS]) || Set();
}
