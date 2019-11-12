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
  Principal,
  PrincipalBuilder,
  Role,
  RoleBuilder,
} = Models;

const MOCK_ORG_ID :UUID = '80630df9-f6a4-4213-bbcb-b89826cf14a6';

const MOCK_PRINCIPAL :Principal = new PrincipalBuilder()
  .setId('MockPrincipalId')
  .setType(PrincipalTypes.USER)
  .build();

const MOCK_ROLE :Role = new RoleBuilder()
  .setDescription('MockRoleDescription')
  .setId('ec6865e6-e60e-424b-a071-6a9c1603d735')
  .setOrganizationId(MOCK_ORG_ID)
  .setPrincipal(MOCK_PRINCIPAL)
  .setTitle('MockRoleTitle')
  .build();

const MOCK_ORGANIZATION :Organization = (new OrganizationBuilder())
  .setApps([genRandomUUID(), genRandomUUID()])
  .setAutoApprovedEmails(['openlattice.com'])
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
  .setRoles([
    (new RoleBuilder())
      .setDescription('MockOrgRoleDescription')
      .setId(genRandomUUID())
      .setOrganizationId(MOCK_ORG_ID)
      .setPrincipal(
        (new PrincipalBuilder())
          .setId('MockOrgRolePrincipalId')
          .setType(PrincipalTypes.ROLE)
          .build()
      )
      .setTitle('MockOrgRoleTitle')
      .build()
  ])
  .setTitle('MockOrgTitle')
  .build();

export {
  MOCK_ORGANIZATION,
  MOCK_PRINCIPAL,
  MOCK_ROLE,
};
