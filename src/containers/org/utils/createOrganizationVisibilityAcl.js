/*
 * @flow
 */

import { Models, Types } from 'lattice';
import type { Principal, UUID } from 'lattice';

import { AUTHENTICATED_USER } from '../../../common/constants';

const {
  Ace,
  AceBuilder,
  Acl,
  AclBuilder,
  PrincipalBuilder,
} = Models;
const { PermissionTypes, PrincipalTypes } = Types;

function createOrganizationVisibilityAcl(organizationId :UUID) :Acl {
  const principal :Principal = (new PrincipalBuilder())
    .setType(PrincipalTypes.ROLE)
    .setId(AUTHENTICATED_USER)
    .build();

  const ace :Ace = (new AceBuilder())
    .setPermissions([PermissionTypes.READ])
    .setPrincipal(principal)
    .build();

  const acl :Acl = (new AclBuilder())
    .setAclKey([organizationId])
    .setAces([ace])
    .build();

  return acl;
}

export default createOrganizationVisibilityAcl;
