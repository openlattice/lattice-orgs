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

type DataSetPermissionTypeSelection = {|
  dataSetId :UUID;
  permissionType :PermissionType;
|};

type ReactSelectOption<V> = {|
  label :string;
  value :V;
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

type UserProfile = {
  email :string;
  familyName :string;
  givenName :string;
  id :string;
  name :string;
};

export type {
  AuthorizationObject,
  DataSetPermissionTypeSelection,
  ReactSelectOption,
  SagaError,
  SearchEntitySetsHit,
  UserProfile,
};
