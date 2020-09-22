/*
 * @flow
 */

import {
  List,
  Map,
  getIn,
  hasIn,
} from 'immutable';
import type { Ace, Principal, UUID } from 'lattice';

import { ACES, PERMISSIONS } from '../constants';

export default function selectPermissions(keys :List<List<UUID>>, principal ?:Principal) {

  return (state :Map) :Map<List<UUID>, Ace> => {

    if (!principal) {
      return Map();
    }

    const permissions :Map<List<UUID>, Ace> = Map().withMutations((mutableMap :Map) => {
      keys.forEach((key :List<UUID>) => {
        if (hasIn(state, [PERMISSIONS, ACES, key])) {
          const aces :List<Ace> = getIn(state, [PERMISSIONS, ACES, key]);
          const targetAce = aces.find((ace :Ace) => (
            ace.principal.id === principal.id && ace.principal.type === principal.type
          ));
          if (targetAce) {
            mutableMap.set(List(key), targetAce);
          }
        }
      });
    });

    return permissions;
  };
}
