/*
 * @flow
 */

import { get } from 'immutable';

import { isDefined, isNonEmptyString } from './LangUtils';

function getUserId(user :any) :string {

  if (!isDefined(user)) {
    return '';
  }

  // handling various possible values that "user" can be:
  //   com.openlattice.organization.OrganizationMember
  //   com.openlattice.authorization.Principal
  let userPrincipal = get(user, 'principal', user);
  userPrincipal = get(userPrincipal, 'principal', userPrincipal);
  const userId = get(userPrincipal, 'id', '');
  return userId || '';
}

function getUserProfileLabel(user :any) :string {

  if (!isDefined(user)) {
    return '';
  }

  const auth0UserProfile = get(user, 'profile', user);
  const userId :string = get(auth0UserProfile, 'user_id', '');
  const nickname :string = get(auth0UserProfile, 'nickname', '');
  const username :string = get(auth0UserProfile, 'username', '');
  const email :string = get(auth0UserProfile, 'email', '');

  let label :string = nickname || username;

  if (isNonEmptyString(email) && email !== label) {
    label = `${label} - ${email}`;
  }

  if (isNonEmptyString(userId)) {
    if (userId.startsWith('auth0')) {
      label = `${label} - Auth0`;
    }
    else if (userId.startsWith('facebook')) {
      label = `${label} - Facebook`;
    }
    else if (userId.startsWith('google')) {
      label = `${label} - Google`;
    }
  }
  else {
    label = `${getUserId(user)}`;
  }

  return label;
}

export {
  getUserId,
  getUserProfileLabel,
};
