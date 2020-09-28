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
import { List, Set } from 'immutable';
import { Models, Types } from 'lattice';
import {
  AuthorizationsApiActions,
  AuthorizationsApiSagas,
  DataSetsApiActions,
  DataSetsApiSagas,
  OrganizationsApiActions,
  OrganizationsApiSagas,
} from 'lattice-sagas';
import { Logger, ReduxUtils } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { getPermissions } from '../../../core/permissions/actions';
import { selectOrganizationEntitySetIds, selectOrganizationMembers } from '../../../core/redux/utils';
import { AxiosUtils } from '../../../utils';
import { INITIALIZE_ORGANIZATION, initializeOrganization } from '../actions';
import type { AuthorizationObject } from '../../../types';

const LOG = new Logger('OrgsSagas');

const {
  AccessCheck,
  AccessCheckBuilder,
  Organization,
  OrganizationBuilder,
} = Models;
const { PermissionTypes } = Types;
const { selectOrganization } = ReduxUtils;

const { getAuthorizations } = AuthorizationsApiActions;
const { getAuthorizationsWorker } = AuthorizationsApiSagas;
const { getOrganizationDataSets } = DataSetsApiActions;
const { getOrganizationDataSetsWorker } = DataSetsApiSagas;
const {
  getOrganization,
  getOrganizationEntitySets,
  getOrganizationMembers,
} = OrganizationsApiActions;
const {
  getOrganizationEntitySetsWorker,
  getOrganizationMembersWorker,
  getOrganizationWorker,
} = OrganizationsApiSagas;

function* initializeOrganizationWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(initializeOrganization.request(action.id, action.value));

    const organizationId :UUID = action.value;

    let organization :?Organization = yield select(selectOrganization(organizationId));
    const members :List = yield select(selectOrganizationMembers(organizationId));
    let entitySetIds :Set<UUID> = yield select(selectOrganizationEntitySetIds(organizationId));

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

    // TODO - figure out how to "expire" stored data
    let getOrganizationEntitySetsCall = call(() => {});
    if (entitySetIds.isEmpty()) {
      getOrganizationEntitySetsCall = call(getOrganizationEntitySetsWorker, getOrganizationEntitySets(organizationId));
    }

    // let getOrganizationDataSetsCall = call(() => {});
    const getOrganizationDataSetsCall = call(
      getOrganizationDataSetsWorker,
      getOrganizationDataSets({ organizationId, columns: false }),
    );

    const accessChecks :AccessCheck[] = [
      (new AccessCheckBuilder())
        .setAclKey([organizationId])
        .setPermissions([PermissionTypes.OWNER])
        .build()
    ];
    const getAuthorizationsCall = call(getAuthorizationsWorker, getAuthorizations(accessChecks));

    // OPTIMIZATION - perhaps spawn() getOrganizationEntitySets as it's not immediately required
    const [
      getOrganizationResponse,
      getOrganizationMembersResponse,
      getOrganizationEntitySetsResponse,
      getOrganizationDataSetsResponse,
      getAuthorizationsResponse,
    ] :Array<?WorkerResponse> = yield all([
      getOrganizationCall,
      getOrganizationMembersCall,
      getOrganizationEntitySetsCall,
      getOrganizationDataSetsCall,
      getAuthorizationsCall,
    ]);

    if (getOrganizationResponse) {
      if (getOrganizationResponse.error) throw getOrganizationResponse.error;
      organization = (new OrganizationBuilder(getOrganizationResponse.data)).build();
    }

    if (getOrganizationMembersResponse && getOrganizationMembersResponse.error) {
      throw getOrganizationMembersResponse.error;
    }

    if (getOrganizationEntitySetsResponse) {
      if (getOrganizationEntitySetsResponse.error) throw getOrganizationEntitySetsResponse.error;
      entitySetIds = Set(Object.keys(getOrganizationEntitySetsResponse.data));
    }

    let atlasDataSetIds = Set();
    if (getOrganizationDataSetsResponse) {
      if (getOrganizationDataSetsResponse.error) throw getOrganizationDataSetsResponse.error;
      atlasDataSetIds = Set(getOrganizationDataSetsResponse.data.map((dataSet) => dataSet.id));
    }

    let isOwner = false;
    if (getAuthorizationsResponse) {
      if (getAuthorizationsResponse.error) throw getAuthorizationsResponse.error;
      const authorizations :AuthorizationObject[] = getAuthorizationsResponse.data;
      isOwner = authorizations[0].permissions[PermissionTypes.OWNER] === true;
    }

    yield put(getPermissions(entitySetIds.map((id) => List([id]))));
    yield put(getPermissions(atlasDataSetIds.map((id) => List([id]))));

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
