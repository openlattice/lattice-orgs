/*
 * @flow
 */

import type {
  EntitySetObject,
  PermissionType,
  PropertyTypeObject,
  UUID,
} from 'lattice';

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

type SearchEntitySetsHit = {
  entitySet :EntitySetObject;
  propertyTypes :PropertyTypeObject[];
};

export type {
  AuthorizationObject,
  PermissionSelection,
  ReactSelectOption,
  SagaError,
  SearchEntitySetsHit,
};
