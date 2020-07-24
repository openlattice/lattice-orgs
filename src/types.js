/*
 * @flow
 */

import type { UUID } from 'lattice';

type AuthorizationObject = {|
  aclKey :UUID[];
  permissions :{
    OWNER ?:boolean;
    READ ?:boolean;
    WRITE ?:boolean;
  };
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
  ReactSelectOption,
  SagaError,
};
