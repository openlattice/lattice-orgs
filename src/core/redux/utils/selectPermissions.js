/*
 * @flow
 */

import {
  List,
  Map,
  Set,
  getIn,
  hasIn,
} from 'immutable';
import type { Ace, Principal, UUID } from 'lattice';

import { ACES, PERMISSIONS } from '../constants';

export default function selectPermissions(keys :Set<Set<UUID>>, principal ?:Principal) {

  return (state :Map) :Map<Set<UUID>, Ace> => {

    if (!principal) {
      return Map();
    }

    const permissions :Map<Set<UUID>, Ace> = Map().withMutations((mutableMap :Map) => {
      keys.forEach((key :Set<UUID>) => {
        if (hasIn(state, [PERMISSIONS, ACES, key])) {
          const aces :List<Ace> = getIn(state, [PERMISSIONS, ACES, key]);
          const targetAce = aces.find((ace :Ace) => (
            ace.principal.id === principal.id && ace.principal.type === principal.type
          ));
          if (targetAce) {
            mutableMap.set(key, targetAce);
          }
        }
      });
    });

    return permissions;
  };
}
