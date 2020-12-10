/*
 * @flow
 */

import {
  List,
  Map,
  getIn,
  hasIn,
} from 'immutable';
import type { Ace, UUID } from 'lattice';

import { ACES, PERMISSIONS } from '../constants';

const EMPTY_LIST = List();

export default function selectObjectPermissions(key :List<UUID>) {

  return (state :Map) :List<Ace> => {

    if (hasIn(state, [PERMISSIONS, ACES, key])) {
      return getIn(state, [PERMISSIONS, ACES, key]);
    }

    return EMPTY_LIST;
  };
}
