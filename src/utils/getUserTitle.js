/*
 * @flow
 */

import { get } from 'immutable';
import { LangUtils, PersonUtils } from 'lattice-utils';

const { isNonEmptyString } = LangUtils;
const { getUserId } = PersonUtils;

export default function getUserTitle(user :any, thisUserId :?string) :string {

  if (!user) {
    return '';
  }

  const userId :string = getUserId(user) || '';
  const auth0UserProfile = get(user, 'profile', user);
  const email :string = get(auth0UserProfile, 'email', '');
  const name :string = get(auth0UserProfile, 'name', '');
  const username :string = get(auth0UserProfile, 'username', '');

  let title :string = name || username;
  if (title === 'undefined undefined') {
    title = '';
  }

  if (isNonEmptyString(email) && email !== title) {
    if (email.startsWith(title)) {
      title = email;
    }
    else {
      title = `${title} - ${email}`;
    }
  }

  if (userId.startsWith('auth0')) {
    title = `${title} - Auth0`;
  }
  else if (userId.startsWith('google')) {
    title = `${title} - Google`;
  }

  if (!isNonEmptyString(title)) {
    title = userId;
  }

  if (userId === thisUserId) {
    title = `${title} (you)`;
  }

  return title || '';
}
