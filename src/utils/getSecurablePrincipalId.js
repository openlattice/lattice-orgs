/*
 * @flow
 */

import { getIn } from 'immutable';
import { Constants } from 'lattice';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

const { AT_CLASS } = Constants;
const { isValidUUID } = ValidationUtils;

export default function getSecurablePrincipalId(user :any) :?UUID {

  const securablePrincipalClass = getIn(user, ['principal', AT_CLASS]);
  const principalId :?UUID = getIn(user, ['principal', 'id']);

  if (isValidUUID(principalId) && securablePrincipalClass === 'com.openlattice.authorization.SecurablePrincipal') {
    return principalId;
  }

  return undefined;
}
