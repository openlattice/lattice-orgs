/*
 * @flow
 */

import React, { useState } from 'react';

import { faChevronDown, faChevronUp } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Types } from 'lattice';
import {
  CardSegment,
  Checkbox,
  IconButton,
  Typography,
} from 'lattice-ui-kit';
import { LangUtils } from 'lattice-utils';
import type { Ace, PermissionType } from 'lattice';

import { SpaceBetweenGrid } from '../../components';

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
} :{
  ace :Ace;
}) => {

  const [isOpen, setIsOpen] = useState(false);

  let title = '';
  if (ace.principal.type === PrincipalTypes.ROLE) {
    // const role :?Role = rolesByPrincipalId.get(ace.principal.id);
    // if (role) {
    //   title = role.title;
    // }
  }
  else if (ace.principal.type === PrincipalTypes.USER) {
    // NOTE: it's not guaranteed that this user will be a member of the org, in which case
    // we have a problem... we can't get their "profile" to show their name
    // https://jira.openlattice.com/browse/LATTICE-2645
    // const member :?Map = membersByPrincipalId.get(ace.principal.id);
    // title = getUserProfileLabel(member);
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
        <div>
          <Typography component="span">{permissions}</Typography>
          <IconButton onClick={() => setIsOpen(!isOpen)}>
            <FontAwesomeIcon fixedWidth icon={isOpen ? faChevronUp : faChevronDown} />
          </IconButton>
        </div>
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
