/*
 * @flow
 */

import type {
  EntitySetObject,
  PermissionType,
  PropertyTypeObject,
  UUID,
} from 'lattice';

import { DataSetTypes } from '../constants';

export type AuthorizationObject = {|
  aclKey :UUID[];
  permissions :{
    OWNER ?:boolean;
    READ ?:boolean;
    WRITE ?:boolean;
  };
|};

export type DataSetPermissionTypeSelection = {|
  dataSetId :UUID;
  permissionType :PermissionType;
|};

export type DataSetType = $Values<typeof DataSetTypes>;

export type DataSetTypesEnum = {|
  ENTITY_SET :'EntitySet';
  EXTERNAL_TABLE :'ExternalTable';
|};

export type ReactSelectOption<V> = {|
  label :string;
  value :V;
|};

export type RJSFError = {
  message :string;
  name :string;
  params :Object;
  property :string;
  schemaPath :string;
  stack :string;
};

export type SagaError = {
  message :string;
  status :number;
  statusText :string;
};

export type SearchEntitySetsHit = {
  entitySet :EntitySetObject;
  propertyTypes :PropertyTypeObject[];
};

export type UserProfile = {
  email :string;
  familyName :string;
  givenName :string;
  id :string;
  name :string;
};
