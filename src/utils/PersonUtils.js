/*
 * @flow
 */

import _includes from 'lodash/includes';
import { get, getIn } from 'immutable';
import { Constants } from 'lattice';
import { AuthUtils } from 'lattice-auth';
import { LangUtils, ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

const { AT_CLASS } = Constants;
const { isDefined, isNonEmptyString } = LangUtils;
const { isValidUUID } = ValidationUtils;

function getPrincipalId(user :any) :?UUID {

  const securablePrincipalClass = getIn(user, ['principal', AT_CLASS]);
  const principalId :?UUID = getIn(user, ['principal', 'id']);

  if (isValidUUID(principalId) && securablePrincipalClass === 'com.openlattice.authorization.SecurablePrincipal') {
    return principalId;
  }

  return undefined;
}

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
    // com.auth0.json.mgmt.users.User
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

  const userId1 :string = getUserId(user1);
  const userId2 :string = getUserId(user2);
  const label1 :string = getUserProfileLabel(user1) || userId1;
  const label2 :string = getUserProfileLabel(user2) || userId2;

  if (label1 < label2) {
    return -1;
  }

  if (label1 > label2) {
    return 1;
  }

  return 0;
}

function filterUser(user :any, filter :string) :boolean {

  const userId :string = getUserId(user);
  if (filter === userId) {
    return true;
  }

  const auth0UserProfile = get(user, 'profile', user);
  const nickname :string = get(auth0UserProfile, 'nickname', '');
  const username :string = get(auth0UserProfile, 'username', '');
  const email :string = get(auth0UserProfile, 'email', '');

  return (
    _includes(nickname, filter)
    || _includes(username, filter)
    || _includes(email, filter)
  );
}

export {
  filterUser,
  getPrincipalId,
  getUserId,
  getUserProfileLabel,
  sortByProfileLabel,
};
