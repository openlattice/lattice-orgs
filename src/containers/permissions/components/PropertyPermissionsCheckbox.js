/*
 * @flow
 */

import React from 'react';

import { faLock } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Checkbox, Tooltip } from 'lattice-ui-kit';
import type {
  Ace,
  PermissionType,
  UUID,
} from 'lattice';

const PropertyPermissionsCheckbox = ({
  ace,
  isLocked,
  onChange,
  permissionType,
  propertyId,
} :{|
  ace :?Ace;
  isLocked :boolean;
  onChange :(event :SyntheticEvent<HTMLInputElement>) => void;
  permissionType :PermissionType;
  propertyId :UUID;
|}) => (
  isLocked
    ? (
      <Tooltip arrow placement="left" title="Unauthorized to view permissions">
        <div>
          <FontAwesomeIcon fixedWidth icon={faLock} />
        </div>
      </Tooltip>
    )
    : (
      <Checkbox
          data-permission-type={permissionType}
          data-property-id={propertyId}
          checked={ace?.permissions.includes(permissionType)}
          onChange={onChange} />
    )
);

export default PropertyPermissionsCheckbox;
