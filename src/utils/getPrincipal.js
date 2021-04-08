/*
 * @flow
 */

import { get, getIn, has } from 'immutable';
import { Constants, Models } from 'lattice';

import { PRINCIPAL, SECURABLE_PRINCIPAL_CLASS } from './constants';

const { AT_CLASS } = Constants;
const { Principal, PrincipalBuilder } = Models;

export default function getPrincipal(value :any) :?Principal {

  try {
    // com.openlattice.authorization.SecurablePrincipal
    const securablePrincipalClass = getIn(value, [PRINCIPAL, AT_CLASS]);
    if (securablePrincipalClass === SECURABLE_PRINCIPAL_CLASS) {
      const principal = getIn(value, [PRINCIPAL, PRINCIPAL]);
      return (new PrincipalBuilder(principal)).build();
    }

    // ???
    if (has(value, PRINCIPAL)) {
      const principal = get(value, PRINCIPAL);
      return (new PrincipalBuilder(principal)).build();
    }

    // com.openlattice.authorization.Principal
    return (new PrincipalBuilder(value)).build();
  }
  catch (e) { /**/ }

  return undefined;
}
