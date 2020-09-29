/*
 * @flow
 */

import { get, getIn } from 'immutable';
import { Constants } from 'lattice';
import { LangUtils, PersonUtils, ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

const { AT_CLASS } = Constants;
const { isDefined, isNonEmptyString } = LangUtils;
const { getUserId } = PersonUtils;
const { isValidUUID } = ValidationUtils;

function getSecurablePrincipalId(user :any) :?UUID {

  const securablePrincipalClass = getIn(user, ['principal', AT_CLASS]);
  const principalId :?UUID = getIn(user, ['principal', 'id']);

  if (isValidUUID(principalId) && securablePrincipalClass === 'com.openlattice.authorization.SecurablePrincipal') {
    return principalId;
  }

  return undefined;
}

function getUserProfileLabel(user :any, thisUserId :?string) :string {

  if (!isDefined(user)) {
    return '';
  }

  const userId :string = getUserId(user) || '';
  const auth0UserProfile = get(user, 'profile', user);
  const email :string = get(auth0UserProfile, 'email', '');
  const name :string = get(auth0UserProfile, 'name', '');
  const username :string = get(auth0UserProfile, 'username', '');

  let label :string = name || username;

  if (isNonEmptyString(email) && email !== label) {
    if (email.startsWith(label)) {
      label = email;
    }
    else {
      label = `${label} - ${email}`;
    }
  }

  if (userId.startsWith('auth0')) {
    label = `${label} - Auth0`;
  }
  else if (userId.startsWith('google')) {
    label = `${label} - Google`;
  }

  if (!isNonEmptyString(label)) {
    label = userId;
  }

  if (userId === thisUserId) {
    label = `${label} (you)`;
  }

  return label || '';
}

type UserProfile = {
  familyName :string;
  givenName :string;
  name :string;
};

function getUserProfile(user :any) :UserProfile {

  const auth0UserProfile = get(user, 'profile', user);

  let familyName = get(auth0UserProfile, 'family_name');
  if (!isNonEmptyString(familyName)) {
    familyName = '';
  }

  let givenName = get(auth0UserProfile, 'given_name');
  if (!isNonEmptyString(givenName)) {
    givenName = '';
  }

  let name = get(auth0UserProfile, 'name');
  if (!isNonEmptyString(name)) {
    name = '';
  }

  return {
    familyName,
    givenName,
    name,
  };
}

export {
  getSecurablePrincipalId,
  getUserProfile,
  getUserProfileLabel,
};

export type {
  UserProfile,
};
