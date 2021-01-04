/*
 * @flow
 */

import { Types } from 'lattice';
import type { PermissionType } from 'lattice';

import type { ReactSelectOption } from '../../../types';

const { PermissionTypes } = Types;

const PERMISSION_TYPE_RS_OPTIONS :ReactSelectOption<PermissionType>[] = [
  { label: PermissionTypes.OWNER.toLowerCase(), value: PermissionTypes.OWNER },
  { label: PermissionTypes.READ.toLowerCase(), value: PermissionTypes.READ },
  { label: PermissionTypes.WRITE.toLowerCase(), value: PermissionTypes.WRITE },
  { label: PermissionTypes.LINK.toLowerCase(), value: PermissionTypes.LINK },
  { label: PermissionTypes.MATERIALIZE.toLowerCase(), value: PermissionTypes.MATERIALIZE },
];

export {
  PERMISSION_TYPE_RS_OPTIONS,
};
