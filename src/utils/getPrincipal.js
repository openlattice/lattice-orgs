/*
 * @flow
 */

import { get, getIn, has } from 'immutable';
import { Constants, Models } from 'lattice';

const { AT_CLASS } = Constants;
const { Principal, PrincipalBuilder } = Models;

export default function getPrincipal(value :any) :?Principal {

  try {
    // com.openlattice.authorization.SecurablePrincipal
    const securablePrincipalClass = getIn(value, ['principal', AT_CLASS]);
    if (securablePrincipalClass === 'com.openlattice.authorization.SecurablePrincipal') {
      const principal = getIn(value, ['principal', 'principal']);
      return (new PrincipalBuilder(principal)).build();
    }

    // ???
    if (has(value, 'principal')) {
      const principal = get(value, 'principal');
      return (new PrincipalBuilder(principal)).build();
    }

    // com.openlattice.authorization.Principal
    return (new PrincipalBuilder(value)).build();
  }
  catch (e) { /**/ }

  return undefined;
}
