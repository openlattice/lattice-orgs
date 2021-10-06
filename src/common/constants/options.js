/*
 * @flow
 */

import _capitalize from 'lodash/capitalize';
import { Types } from 'lattice';
import type { EntitySetFlagType, PermissionType } from 'lattice';

import { DataSetTypes } from './objects';

import type { DataSetType, ReactSelectOption } from '../types';

const { EntitySetFlagTypes, PermissionTypes } = Types;

export const ES_FLAG_TYPE_RS_OPTIONS :ReactSelectOption<EntitySetFlagType>[] = [
  { label: _capitalize(EntitySetFlagTypes.ASSOCIATION), value: EntitySetFlagTypes.ASSOCIATION },
  { label: _capitalize(EntitySetFlagTypes.AUDIT), value: EntitySetFlagTypes.AUDIT },
  { label: _capitalize(EntitySetFlagTypes.EXTERNAL), value: EntitySetFlagTypes.EXTERNAL },
  { label: _capitalize(EntitySetFlagTypes.LINKING), value: EntitySetFlagTypes.LINKING },
  { label: _capitalize(EntitySetFlagTypes.METADATA), value: EntitySetFlagTypes.METADATA },
  { label: _capitalize(EntitySetFlagTypes.TRANSPORTED), value: EntitySetFlagTypes.TRANSPORTED },
  { label: _capitalize(EntitySetFlagTypes.UNVERSIONED), value: EntitySetFlagTypes.UNVERSIONED },
];

export const PERMISSION_TYPE_RS_OPTIONS :ReactSelectOption<PermissionType>[] = [
  { label: _capitalize(PermissionTypes.OWNER), value: PermissionTypes.OWNER },
  { label: _capitalize(PermissionTypes.READ), value: PermissionTypes.READ },
  { label: _capitalize(PermissionTypes.WRITE), value: PermissionTypes.WRITE },
  { label: _capitalize(PermissionTypes.LINK), value: PermissionTypes.LINK },
  { label: _capitalize(PermissionTypes.MATERIALIZE), value: PermissionTypes.MATERIALIZE },
];

export const DATA_SET_TYPE_RS_OPTIONS :ReactSelectOption<DataSetType>[] = [
  { label: 'Entity Set', value: DataSetTypes.ENTITY_SET },
  { label: 'External Table', value: DataSetTypes.EXTERNAL_TABLE },
];
