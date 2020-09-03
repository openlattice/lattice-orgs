/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { Models, Types } from 'lattice';
import { OrganizationsApiActions, OrganizationsApiSagas } from 'lattice-sagas';
import { Logger, ValidationUtils } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { ADD_ROLE_TO_ORGANIZATION, addRoleToOrganization } from '../actions';

const {
  Principal,
  PrincipalBuilder,
  Role,
  RoleBuilder,
} = Models;
const { PrincipalTypes } = Types;
const { createRole } = OrganizationsApiActions;
const { createRoleWorker } = OrganizationsApiSagas;
const { isValidUUID } = ValidationUtils;

const LOG = new Logger('OrgsSagas');

function* addRoleToOrganizationWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(addRoleToOrganization.request(action.id, action.value));

    const {
      organizationId,
      roleDescription,
      roleTitle,
    } :{|
      organizationId :UUID;
      roleDescription :string;
      roleTitle :string;
    |} = action.value;

    if (!isValidUUID(organizationId)) {
      throw new Error('organizationId must be a valid UUID');
    }

    const principal :Principal = (new PrincipalBuilder())
      .setId(`${organizationId}|${roleTitle.replace(/\W/g, '')}`)
      .setType(PrincipalTypes.ROLE)
      .build();

    const roleBuilder :RoleBuilder = (new RoleBuilder())
      .setDescription(roleDescription)
      .setOrganizationId(organizationId)
      .setPrincipal(principal)
      .setTitle(roleTitle);

    const response :WorkerResponse = yield call(createRoleWorker, createRole(roleBuilder.build()));
    if (response.error) throw response.error;

    const roleId :UUID = response.data;
    const role :Role = roleBuilder
      .setId(roleId)
      .build();

    yield put(addRoleToOrganization.success(action.id, role));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(addRoleToOrganization.failure(action.id));
  }
  finally {
    yield put(addRoleToOrganization.finally(action.id));
  }
}

function* addRoleToOrganizationWatcher() :Saga<*> {

  yield takeEvery(ADD_ROLE_TO_ORGANIZATION, addRoleToOrganizationWorker);
}

export {
  addRoleToOrganizationWatcher,
  addRoleToOrganizationWorker,
};
