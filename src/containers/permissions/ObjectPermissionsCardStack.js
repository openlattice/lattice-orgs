/*
 * @flow
 */

import React, { useMemo } from 'react';

import { List, Map } from 'immutable';
import { Types } from 'lattice';
import { Typography } from 'lattice-ui-kit';
import { useSelector } from 'react-redux';
import type {
  Ace,
  Organization,
  PermissionType,
  Principal,
  Role,
  UUID,
} from 'lattice';

import ObjectPermissionsCard from './ObjectPermissionsCard';

import { selectOrganization, selectOrganizationMembers } from '../../core/redux/selectors';
import { getPrincipal } from '../../utils';

const { PrincipalTypes } = Types;

const ObjectPermissionsCardStack = ({
  filterByPermissionTypes,
  organizationId,
  permissions,
} :{
  filterByPermissionTypes :Array<PermissionType>;
  organizationId :UUID;
  permissions :List<Ace>;
}) => {

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const organizationRoles :Map<Principal, Role> = useMemo(() => (
    Map().withMutations((mutableMap :Map<string, Role>) => {
      organization?.roles.forEach((role :Role) => {
        mutableMap.set(role.principal, role);
      });
    })
  ), [organization]);

  const members :List<Map> = useSelector(selectOrganizationMembers(organizationId));
  const organizationMembers :Map<Principal, Map> = useMemo(() => (
    Map().withMutations((mutableMap :Map<string, Map>) => {
      members.forEach((member :Map) => {
        const principal :?Principal = getPrincipal(member);
        if (principal) {
          mutableMap.set(principal, member);
        }
      });
    })
  ), [members]);

  const permissionsCount :number = permissions.count();

  return (
    <div>
      {
        permissionsCount === 0 && (
          <Typography>No permissions.</Typography>
        )
      }
      {
        permissionsCount > 0 && (
          <div>
            {
              permissions
                .filter((ace :Ace) => (
                  (ace.principal.type === PrincipalTypes.ROLE || ace.principal.type === PrincipalTypes.USER)
                  && (
                    filterByPermissionTypes.every((pt :PermissionType) => ace.permissions.includes(pt))
                  )
                ))
                .map((ace :Ace) => (
                  <ObjectPermissionsCard
                      ace={ace}
                      key={ace.principal.id}
                      organizationId={organizationId}
                      organizationMembers={organizationMembers}
                      organizationRoles={organizationRoles} />
                ))
            }
          </div>
        )
      }
    </div>
  );
};

export default ObjectPermissionsCardStack;
