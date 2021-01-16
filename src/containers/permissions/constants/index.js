/*
 * @flow
 */

import _capitalize from 'lodash/capitalize';
import { Types } from 'lattice';
import type { PermissionType } from 'lattice';

import type { ReactSelectOption } from '../../../types';

const { PermissionTypes } = Types;

const ORDERED_PERMISSIONS = [
  PermissionTypes.OWNER,
  PermissionTypes.READ,
  PermissionTypes.WRITE,
  PermissionTypes.LINK,
  PermissionTypes.MATERIALIZE,
];

const PERMISSION_TYPE_RS_OPTIONS :ReactSelectOption<PermissionType>[] = [
  { label: _capitalize(PermissionTypes.OWNER), value: PermissionTypes.OWNER },
  { label: _capitalize(PermissionTypes.READ), value: PermissionTypes.READ },
  { label: _capitalize(PermissionTypes.WRITE), value: PermissionTypes.WRITE },
  { label: _capitalize(PermissionTypes.LINK), value: PermissionTypes.LINK },
  { label: _capitalize(PermissionTypes.MATERIALIZE), value: PermissionTypes.MATERIALIZE },
];

export {
  ORDERED_PERMISSIONS,
  PERMISSION_TYPE_RS_OPTIONS,
};
