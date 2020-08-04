/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { Map } from 'immutable';
import { Models, Types } from 'lattice';
import {
  AuthorizationsApiActions,
  AuthorizationsApiSagas,
  OrganizationsApiActions,
  OrganizationsApiSagas,
} from 'lattice-sagas';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import {
  IS_OWNER,
  MEMBERS,
  ORGANIZATIONS,
  REDUCERS,
} from '../../../core/redux/constants';
import { AxiosUtils } from '../../../utils';
import { INITIALIZE_ORGANIZATION, initializeOrganization } from '../OrgsActions';
import type { AuthorizationObject } from '../../../types';

const LOG = new Logger('OrgsSagas');

const {
  AccessCheck,
  AccessCheckBuilder,
  Organization,
  OrganizationBuilder,
} = Models;
const { PermissionTypes } = Types;

const { getAuthorizations } = AuthorizationsApiActions;
const { getAuthorizationsWorker } = AuthorizationsApiSagas;
const { getOrganization, getOrganizationMembers } = OrganizationsApiActions;
const { getOrganizationWorker, getOrganizationMembersWorker } = OrganizationsApiSagas;

function* initializeOrganizationWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(initializeOrganization.request(action.id, action.value));

    const organizationId :UUID = action.value;

    let isOwner :?boolean = yield select((s) => s.getIn([REDUCERS.ORGS, IS_OWNER, organizationId], false));
    let organization :?Organization = yield select((s) => s.getIn([REDUCERS.ORGS, ORGANIZATIONS, organizationId]));

    // TODO: expire stored data
    if (!organization) {

      const response1 :WorkerResponse = yield call(getOrganizationWorker, getOrganization(organizationId));
      if (response1.error) throw response1.error;
      organization = (new OrganizationBuilder(response1.data)).build();

      const accessChecks :AccessCheck[] = [
        (new AccessCheckBuilder())
          .setAclKey([organizationId])
          .setPermissions([PermissionTypes.OWNER])
          .build()
      ];

      const response2 :WorkerResponse = yield call(getAuthorizationsWorker, getAuthorizations(accessChecks));
      if (response2.error) throw response2.error;

      const authorizations :AuthorizationObject[] = response2.data;
      isOwner = authorizations[0].permissions[PermissionTypes.OWNER] === true;
    }

    let members :Map = yield select((s) => s.getIn([REDUCERS.ORGS, MEMBERS]));
    if (!members || members.isEmpty()) {
      const response :WorkerResponse = yield call(
        getOrganizationMembersWorker,
        getOrganizationMembers(organizationId),
      );
      if (response.error) throw response.error;
      members = response.data;
    }

    yield put(initializeOrganization.success(action.id, { isOwner, organization }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(initializeOrganization.failure(action.id, AxiosUtils.toSagaError(error)));
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
