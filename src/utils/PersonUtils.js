/*
 * @flow
 */

import { get } from 'immutable';
import { AuthUtils } from 'lattice-auth';

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
  let userId = get(userPrincipal, 'id', '');

  if (!isNonEmptyString(userId)) {
    // com.openlattice.directory.pojo.Auth0UserBasic
    userId = get(user, 'user_id', '');
  }

  return userId || '';
}

function getUserProfileLabel(user :any) :string {

  if (!isDefined(user)) {
    return '';
  }

  const userId :string = getUserId(user);
  const thisUserInfo :Object = AuthUtils.getUserInfo() || { id: '' };

  const auth0UserProfile = get(user, 'profile', user);
  const nickname :string = get(auth0UserProfile, 'nickname', '');
  const username :string = get(auth0UserProfile, 'username', '');
  const email :string = get(auth0UserProfile, 'email', '');

  let label :string = nickname || username || userId;

  if (isNonEmptyString(email) && email !== label) {
    if (email.startsWith(label)) {
      label = email;
    }
    else {
      label = `${label} - ${email}`;
    }
  }

  if (label !== userId) {
    if (userId.startsWith('auth0')) {
      label = `${label} - Auth0`;
    }
    else if (userId.startsWith('facebook')) {
      label = `${label} - Facebook`;
    }
    else if (userId.startsWith('google')) {
      label = `${label} - Google`;
    }
    if (userId === thisUserInfo.id) {
      label = `${label} (you)`;
    }
  }

  return label || '';
}

function sortByProfileLabel(user1 :any, user2 :any) {

  const label1 :string = getUserProfileLabel(user1);
  const label2 :string = getUserProfileLabel(user2);

  if (label1 < label2) {
    return -1;
  }

  if (label1 > label2) {
    return 1;
  }

  return 0;
}

export {
  getUserId,
  getUserProfileLabel,
  sortByProfileLabel,
};
