/*
 * @flow
 */

import { get } from 'immutable';
import { LangUtils } from 'lattice-utils';

import type { UserProfile } from '../types';

const { isNonEmptyString } = LangUtils;

export default function getUserProfile(user :any) :UserProfile {

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
    email: get(auth0UserProfile, 'email', ''),
    familyName,
    givenName,
    id: get(auth0UserProfile, 'user_id', ''),
    name,
  };
}
