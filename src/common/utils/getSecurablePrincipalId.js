/*
 * @flow
 */

import _get from 'lodash/get';
import { getIn, isImmutable } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import {
  AT_CLASS,
  ID,
  PRINCIPAL,
  SECURABLE_PRINCIPAL_CLASS,
} from '../constants';

const { isValidUUID } = ValidationUtils;

export default function getSecurablePrincipalId(user :any) :?UUID {

  let securablePrincipalClass;
  let principalId;

  if (isImmutable(user)) {
    securablePrincipalClass = getIn(user, [PRINCIPAL, AT_CLASS]);
    principalId = getIn(user, [PRINCIPAL, ID]);
  }
  else {
    securablePrincipalClass = _get(user, [PRINCIPAL, AT_CLASS]);
    principalId = _get(user, [PRINCIPAL, ID]);
  }

  if (isValidUUID(principalId) && securablePrincipalClass === SECURABLE_PRINCIPAL_CLASS) {
    return principalId;
  }

  return undefined;
}
