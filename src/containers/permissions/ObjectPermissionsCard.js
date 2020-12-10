/*
 * @flow
 */

import React, { useState } from 'react';

import { faChevronDown, faChevronUp } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map, Set } from 'immutable';
import { Models, Types } from 'lattice';
import {
  CardSegment,
  Checkbox,
  IconButton,
  Typography,
} from 'lattice-ui-kit';
import { LangUtils } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import type {
  Ace,
  PermissionType,
  Principal,
  Role,
  UUID,
} from 'lattice';

import { SpaceBetweenGrid } from '../../components';
import { setPermissions } from '../../core/permissions/actions';
import { getUserProfileLabel } from '../../utils/PersonUtils';

const { AceBuilder } = Models;
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
  organizationMembers,
  organizationRoles,
} :{
  ace :Ace;
  organizationId :UUID;
  organizationMembers :Map<Principal, Map>;
  organizationRoles :Map<Principal, Role>;
}) => {

  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

  let title = '';
  if (ace.principal.type === PrincipalTypes.ROLE) {
    // TODO: it's not guaranteed that this role belongs to this organization, in which case it's not clear exactly
    // how we're going to resolve the role title
    const role :?Role = organizationRoles.get(ace.principal);
    if (role) {
      title = role.title;
    }
  }
  else if (ace.principal.type === PrincipalTypes.USER) {
    // TODO: it's not guaranteed that this user is a member of this organization, in which case it's not clear exactly
    // how we're going to resolve the user's name (or rather, something other than the user_id)
    const member :?Map = organizationMembers.get(ace.principal);
    title = getUserProfileLabel(member);
  }

  if (!isNonEmptyString(title)) {
    title = ace.principal.id;
  }

  const permissions = ORDERED_PERMISSIONS
    .filter((permissionType :PermissionType) => ace.permissions.includes(permissionType))
    .map((permissionType :PermissionType) => permissionType.toLowerCase())
    .join(', ');

  const handleOnChangePermission = (event :SyntheticEvent<HTMLInputElement>) => {

    const { permissionType } = event.currentTarget.dataset;
    const key = List([organizationId]);

    if (PermissionTypes[permissionType]) {

      const updatedAcePermissions = event.currentTarget.checked
        // add permission
        ? Set(ace.permissions).add(permissionType)
        // remove permission
        : Set(ace.permissions).delete(permissionType);

      const updatedAce = (new AceBuilder()).setPermissions(updatedAcePermissions).setPrincipal(ace.principal).build();
      const updatedPermissions :Map<List<UUID>, Ace> = Map().set(key, updatedAce);
      dispatch(setPermissions(updatedPermissions));
    }
  };

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
                    data-permission-type={permissionType}
                    checked={ace.permissions.includes(permissionType)}
                    onChange={handleOnChangePermission} />
              </SpaceBetweenGrid>
            </CardSegment>
          ))
        )
      }
    </CardSegment>
  );
};

export default ObjectPermissionsCard;
