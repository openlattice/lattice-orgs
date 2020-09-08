/*
 * @flow
 */

import _includes from 'lodash/includes';
import { Map, get } from 'immutable';
import { PersonUtils } from 'lattice-utils';

const { getUserId } = PersonUtils;

export default function filterOrganizationMember(member :Object | Map, filter :string) :boolean {

  const userId :?string = getUserId(member);
  if (filter === userId) {
    return true;
  }

  const auth0UserProfile = get(member, 'profile', member);
  const email :string = get(auth0UserProfile, 'email', '');
  const name :string = get(auth0UserProfile, 'name', '');
  const username :string = get(auth0UserProfile, 'username', '');

  return (
    _includes(email, filter)
    || _includes(name, filter)
    || _includes(username, filter)
  );
}
