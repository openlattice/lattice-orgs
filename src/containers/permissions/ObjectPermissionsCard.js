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
import { LangUtils, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type {
  Ace,
  PermissionType,
  Principal,
  Role,
  UUID,
} from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { SpaceBetweenGrid, Spinner } from '../../components';
import { UPDATE_PERMISSIONS, updatePermissions } from '../../core/permissions/actions';
import { PERMISSIONS } from '../../core/redux/constants';
import { getUserProfileLabel } from '../../utils/PersonUtils';

const { AceBuilder } = Models;
const { ActionTypes, PermissionTypes, PrincipalTypes } = Types;
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
  filterByQuery,
  objectKey,
  organizationMembers,
  organizationRoles,
} :{|
  ace :Ace;
  filterByQuery :string;
  objectKey :List<UUID>;
  organizationMembers :Map<Principal, Map>;
  organizationRoles :Map<Principal, Role>;
|}) => {

  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const updatePermissionsRS :?RequestState = useRequestState([PERMISSIONS, UPDATE_PERMISSIONS]);

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

    if (PermissionTypes[permissionType]) {
      const aceForUpdate = (new AceBuilder())
        .setPermissions(Set([permissionType]))
        .setPrincipal(ace.principal)
        .build();
      dispatch(
        updatePermissions({
          actionType: event.currentTarget.checked ? ActionTypes.ADD : ActionTypes.REMOVE,
          permissions: Map().set(objectKey, aceForUpdate),
        })
      );
    }
  };

  // TODO: this is probably not good enough, plan to revisit
  if (!title.toLowerCase().includes(filterByQuery.toLowerCase())) {
    return null;
  }

  // TODO: it would be really nice to have the spinner align with the chevron
  // TODO: spinner doesn't have a min-height like the checkbox, so the row height drops when showing the spinner
  return (
    <CardSegment padding="24px 0">
      <SpaceBetweenGrid>
        <Typography component="span">{title}</Typography>
        <SpaceBetweenGrid gap={8}>
          <Typography component="span">{permissions}</Typography>
          <IconButton aria-label="toggle open/close" onClick={() => setIsOpen(!isOpen)}>
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
                {
                  updatePermissionsRS === RequestStates.PENDING && (
                    <Spinner size="lg" />
                  )
                }
                {
                  updatePermissionsRS !== RequestStates.PENDING && (
                    <Checkbox
                        data-permission-type={permissionType}
                        checked={ace.permissions.includes(permissionType)}
                        onChange={handleOnChangePermission} />
                  )
                }
              </SpaceBetweenGrid>
            </CardSegment>
          ))
        )
      }
    </CardSegment>
  );
};

export default ObjectPermissionsCard;
