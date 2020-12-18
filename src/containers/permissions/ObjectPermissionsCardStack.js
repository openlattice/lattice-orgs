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
  PropertyType,
  Role,
  UUID,
} from 'lattice';

import ObjectPermissionsCard from './ObjectPermissionsCard';

import { selectDataSetProperties, selectOrganization, selectOrganizationMembers } from '../../core/redux/selectors';
import { getPrincipal } from '../../utils';

const { PrincipalTypes } = Types;

const ObjectPermissionsCardStack = ({
  filterByPermissionTypes,
  filterByQuery,
  isDataSet,
  objectKey,
  organizationId,
  permissions,
} :{|
  filterByPermissionTypes :Array<PermissionType>;
  filterByQuery :string;
  isDataSet :boolean;
  objectKey :List<UUID>;
  organizationId :UUID;
  permissions :List<Ace>;
|}) => {

  const properties :Map<UUID, PropertyType | Map> = useSelector(selectDataSetProperties(objectKey.get(0)));

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
                  filterByQuery={filterByQuery}
                  isDataSet={isDataSet}
                  key={ace.principal.id}
                  objectKey={objectKey}
                  organizationMembers={organizationMembers}
                  organizationRoles={organizationRoles}
                  properties={properties} />
            ))
        )
      }
    </div>
  );
};

ObjectPermissionsCardStack.defaultProps = {
  isDataSet: false,
};

export default ObjectPermissionsCardStack;
