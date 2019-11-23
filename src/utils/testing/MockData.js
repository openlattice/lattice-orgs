/*
 * @flow
 */

import { Models, Types } from 'lattice';
// import type { FQN } from 'lattice';

import { genRandomUUID } from './MockUtils';

const {
  PrincipalTypes,
} = Types;

const {
  Organization,
  OrganizationBuilder,
  PrincipalBuilder,
  Role,
  RoleBuilder,
} = Models;

const MOCK_ORG_ID :UUID = '80630df9-f6a4-4213-bbcb-b89826cf14a6';

const MOCK_ORG_ROLE :Role = (new RoleBuilder())
  .setDescription('MockOrgRoleDescription')
  .setId('235558db-5414-4ec7-9651-2a6867e2784e')
  .setOrganizationId(MOCK_ORG_ID)
  .setPrincipal(
    (new PrincipalBuilder())
      .setId('MockOrgRolePrincipalId')
      .setType(PrincipalTypes.ROLE)
      .build()
  )
  .setTitle('MockOrgRoleTitle')
  .build();

const MOCK_ORG :Organization = (new OrganizationBuilder())
  .setApps([genRandomUUID(), genRandomUUID()])
  .setEmailDomains(['openlattice.com'])
  .setDescription('MockOrgDescription')
  .setId(MOCK_ORG_ID)
  .setMembers([
    (new PrincipalBuilder())
      .setId('MockOrgMemberPrincipal')
      .setType(PrincipalTypes.USER)
      .build()
  ])
  .setPartitions([128])
  .setPrincipal(
    (new PrincipalBuilder())
      .setId('MockOrgPrincipalId')
      .setType(PrincipalTypes.ORGANIZATION)
      .build()
  )
  .setRoles([MOCK_ORG_ROLE])
  .setTitle('MockOrgTitle')
  .build();

export {
  MOCK_ORG,
  MOCK_ORG_ID,
  MOCK_ORG_ROLE,
};
