/*
 * @flow
 */

import {
  all,
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List } from 'immutable';
import { Models, Types } from 'lattice';
import {
  AuthorizationsApiActions,
  AuthorizationsApiSagas,
  OrganizationsApiActions,
  OrganizationsApiSagas,
} from 'lattice-sagas';
import { AxiosUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { isAppInstalled } from '../../../core/edm/actions';
import { APPS } from '../../../core/edm/constants';
import { isAppInstalledWorker } from '../../../core/edm/sagas';
import { IS_OWNER, ORGANIZATION } from '../../../core/redux/constants';
import { selectOrganization, selectOrganizationMembers } from '../../../core/redux/selectors';
import { INITIALIZE_ORGANIZATION, initializeOrganization } from '../actions';
import type { AuthorizationObject } from '../../../types';

const {
  AccessCheck,
  AccessCheckBuilder,
  Organization,
  OrganizationBuilder,
} = Models;
const { PermissionTypes } = Types;

const { getAuthorizations } = AuthorizationsApiActions;
const { getAuthorizationsWorker } = AuthorizationsApiSagas;
const {
  getOrganization,
  getOrganizationMembers,
} = OrganizationsApiActions;
const {
  getOrganizationMembersWorker,
  getOrganizationWorker,
} = OrganizationsApiSagas;
const { toSagaError } = AxiosUtils;

const LOG = new Logger('OrgsSagas');

function* initializeOrganizationWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(initializeOrganization.request(action.id, action.value));

    const organizationId :UUID = action.value;

    let organization :?Organization = yield select(selectOrganization(organizationId));
    const members :List = yield select(selectOrganizationMembers(organizationId));

    // TODO - figure out how to "expire" stored data
    let getOrganizationCall = call(() => {});
    if (!organization) {
      getOrganizationCall = call(getOrganizationWorker, getOrganization(organizationId));
    }

    // TODO - figure out how to "expire" stored data
    let getOrganizationMembersCall = call(() => {});
    if (members.isEmpty()) {
      getOrganizationMembersCall = call(getOrganizationMembersWorker, getOrganizationMembers(organizationId));
    }

    const accessChecks :AccessCheck[] = [
      (new AccessCheckBuilder())
        .setAclKey([organizationId])
        .setPermissions([PermissionTypes.OWNER])
        .build()
    ];
    const getAuthorizationsCall = call(getAuthorizationsWorker, getAuthorizations(accessChecks));

    const isAppInstalledCall = call(
      isAppInstalledWorker,
      isAppInstalled({ appName: APPS.ACCESS_REQUESTS, organizationId }),
    );

    const [
      getOrganizationResponse,
      getOrganizationMembersResponse,
      getAuthorizationsResponse,
    ] :Array<?WorkerResponse> = yield all([
      getOrganizationCall,
      getOrganizationMembersCall,
      getAuthorizationsCall,
      isAppInstalledCall,
    ]);

    if (getOrganizationResponse) {
      if (getOrganizationResponse.error) throw getOrganizationResponse.error;
      organization = (new OrganizationBuilder(getOrganizationResponse.data)).build();
    }

    if (getOrganizationMembersResponse && getOrganizationMembersResponse.error) {
      throw getOrganizationMembersResponse.error;
    }

    let isOwner = false;
    if (getAuthorizationsResponse) {
      if (getAuthorizationsResponse.error) throw getAuthorizationsResponse.error;
      const authorizations :AuthorizationObject[] = getAuthorizationsResponse.data;
      isOwner = authorizations[0].permissions[PermissionTypes.OWNER] === true;
    }

    yield put(initializeOrganization.success(action.id, {
      [IS_OWNER]: isOwner,
      [ORGANIZATION]: organization,
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(initializeOrganization.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(initializeOrganization.finally(action.id));
  }
}

function* initializeOrganizationWatcher() :Saga<*> {

  yield takeEvery(INITIALIZE_ORGANIZATION, initializeOrganizationWorker);
}

export {
  initializeOrganizationWatcher,
  initializeOrganizationWorker,
};
