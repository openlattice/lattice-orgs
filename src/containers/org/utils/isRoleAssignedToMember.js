/*
 * @flow
 */

import {
  List,
  Map,
  get,
  getIn,
} from 'immutable';
import { Types } from 'lattice';
import type { UUID } from 'lattice';

const { PrincipalTypes } = Types;

export default function isRoleAssignedToMember(member :Object | Map, roleId :?UUID) :boolean {

  if (!roleId) {
    return false;
  }

  const roles = get(member, 'roles', List());
  const roleIndex :number = roles.findIndex((role) => (
    get(role, 'id') === roleId && getIn(role, ['principal', 'type']) === PrincipalTypes.ROLE
  ));

  return roleIndex !== -1;
}
