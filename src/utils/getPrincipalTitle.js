/*
 * @flow
 */

import { Map } from 'immutable';
import { Types } from 'lattice';
import { LangUtils } from 'lattice-utils';
import type { Principal } from 'lattice';

import getUserTitle from './getUserTitle';

const { PrincipalTypes } = Types;
const { isNonEmptyString } = LangUtils;

export default function getPrincipalTitle(principal :Principal, user :?Map, thisUserId :?string) :string {

  let principalTitle = '';

  if (principal.type === PrincipalTypes.ROLE) {
    principalTitle = principal.id.substring(principal.id.indexOf('|') + 1);
  }
  else if (principal.type === PrincipalTypes.USER) {
    principalTitle = getUserTitle(user, thisUserId);
  }

  if (!isNonEmptyString(principalTitle)) {
    principalTitle = principal.id;
  }

  return principalTitle;
}
