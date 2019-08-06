/*
 * @flow
 */

import { get } from 'immutable';

import { isDefined, isNonEmptyString } from './LangUtils';

function getUserProfileLabel(user :any) :string {

  if (!isDefined(user)) {
    return '';
  }

  // https://auth0.com/docs/api/authentication#user-profile
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

  return label;
}

export {
  getUserProfileLabel,
};
