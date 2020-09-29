/*
 * @flow
 */

import type { PermissionType, UUID } from 'lattice';

type AuthorizationObject = {|
  aclKey :UUID[];
  permissions :{
    OWNER ?:boolean;
    READ ?:boolean;
    WRITE ?:boolean;
  };
|};

type PermissionSelection = {|
  dataSetId :UUID;
  permissionType :PermissionType;
|};

type ReactSelectOption = {|
  label :string;
  value :mixed;
|};

type SagaError = {
  message :string;
  status :number;
  statusText :string;
};

export type {
  AuthorizationObject,
  PermissionSelection,
  ReactSelectOption,
  SagaError,
};
