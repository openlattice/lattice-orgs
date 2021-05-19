/*
 * @flow
 */

import React from 'react';

import _isFunction from 'lodash/isFunction';
import { List } from 'immutable';
// $FlowFixMe
import { Checkbox } from 'lattice-ui-kit';
import type { Ace, PermissionType, UUID } from 'lattice';

import PermissionsLock from './PermissionsLock';

const ObjectPermissionCheckbox = ({
  ace,
  isAuthorized,
  objectKey,
  onChange,
  permissionType,
} :{|
  ace :?Ace;
  isAuthorized :boolean;
  objectKey :List<UUID>;
  onChange :(objectKey :List<UUID>, permissionType :PermissionType, isChecked :boolean) => void;
  permissionType :PermissionType;
|}) => {

  const handleOnChange = (event :SyntheticEvent<HTMLInputElement>) => {
    if (_isFunction(onChange)) {
      onChange(objectKey, permissionType, event.currentTarget.checked);
    }
  };

  if (isAuthorized) {
    return (
      <Checkbox checked={ace?.permissions.includes(permissionType)} onChange={handleOnChange} />
    );
  }

  return (
    <PermissionsLock />
  );
};

export default ObjectPermissionCheckbox;
