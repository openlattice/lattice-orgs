/*
 * @flow
 */

import React, { useMemo, useState } from 'react';

import { faChevronDown, faChevronUp } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import { Types } from 'lattice';
import {
  CardSegment,
  Checkbox,
  IconButton,
  Typography,
} from 'lattice-ui-kit';
import { LangUtils } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type {
  Ace,
  Organization,
  PermissionType,
  Principal,
  Role,
  UUID,
} from 'lattice';

import { SpaceBetweenGrid } from '../../components';
import { selectOrganization, selectOrganizationMembers } from '../../core/redux/selectors';
import { getPrincipal } from '../../utils';
import { getUserProfileLabel } from '../../utils/PersonUtils';

const { PermissionTypes, PrincipalTypes } = Types;
const { isNonEmptyString } = LangUtils;

const ORDERED_PERMISSIONS = [
  PermissionTypes.OWNER,
  PermissionTypes.READ,
  PermissionTypes.WRITE,
  PermissionTypes.LINK,
  PermissionTypes.MATERIALIZE,
];

const ObjectPermissionsCard = ({
  ace,
  organizationId,
} :{
  ace :Ace;
  organizationId :UUID;
}) => {

  const [isOpen, setIsOpen] = useState(false);

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const rolesByPrincipalId :Map<string, Role> = useMemo(() => (
    Map().withMutations((mutableMap :Map<string, Role>) => {
      organization?.roles.forEach((role :Role) => {
        mutableMap.set(role.principal.id, role);
      });
    })
  ), [organization]);

  const members :List<Map> = useSelector(selectOrganizationMembers(organizationId));
  const membersByPrincipalId :Map<string, Map> = useMemo(() => (
    Map().withMutations((mutableMap :Map<string, Map>) => {
      members.forEach((member :Map) => {
        const principal :?Principal = getPrincipal(member);
        if (principal) {
          mutableMap.set(principal.id, member);
        }
      });
    })
  ), [members]);

  let title = '';
  if (ace.principal.type === PrincipalTypes.ROLE) {
    // TODO: it's not guaranteed that this role belongs to this organization, in which case it's not clear exactly
    // how we're going to resolve the role title
    const role :?Role = rolesByPrincipalId.get(ace.principal.id);
    if (role) {
      title = role.title;
    }
  }
  else if (ace.principal.type === PrincipalTypes.USER) {
    // TODO: it's not guaranteed that this user is a member of this organization, in which case it's not clear exactly
    // how we're going to resolve the user's name (or rather, something other than the user_id)
    const member :?Map = membersByPrincipalId.get(ace.principal.id);
    title = getUserProfileLabel(member);
  }

  if (!isNonEmptyString(title)) {
    title = ace.principal.id;
  }

  const permissions = ORDERED_PERMISSIONS
    .filter((permissionType :PermissionType) => ace.permissions.includes(permissionType))
    .map((permissionType :PermissionType) => permissionType.toLowerCase())
    .join(', ');

  return (
    <CardSegment padding="24px 0">
      <SpaceBetweenGrid>
        <Typography component="span">{title}</Typography>
        <SpaceBetweenGrid gap={8}>
          <Typography component="span">{permissions}</Typography>
          <IconButton onClick={() => setIsOpen(!isOpen)}>
            <FontAwesomeIcon fixedWidth icon={isOpen ? faChevronUp : faChevronDown} />
          </IconButton>
        </SpaceBetweenGrid>
      </SpaceBetweenGrid>
      {
        isOpen && (
          ORDERED_PERMISSIONS.map((permissionType :PermissionType) => (
            <CardSegment borderless key={permissionType} padding="0 0 0 64px">
              <SpaceBetweenGrid>
                <Typography component="span">{permissionType.toLowerCase()}</Typography>
                <Checkbox
                    checked={ace.permissions.includes(permissionType)}
                    onChange={() => {}} />
              </SpaceBetweenGrid>
            </CardSegment>
          ))
        )
      }
    </CardSegment>
  );
};

export default ObjectPermissionsCard;
