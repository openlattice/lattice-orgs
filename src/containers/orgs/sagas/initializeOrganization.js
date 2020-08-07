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
import { Map } from 'immutable';
import { Models, Types } from 'lattice';
import {
  AuthorizationsApiActions,
  AuthorizationsApiSagas,
  OrganizationsApiActions,
  OrganizationsApiSagas,
} from 'lattice-sagas';
import { Logger, ReduxUtils } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { ENTITY_SETS, MEMBERS, ORGANIZATIONS } from '../../../core/redux/constants';
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
const { selectOrganization } = ReduxUtils;

const { getAuthorizations } = AuthorizationsApiActions;
const { getAuthorizationsWorker } = AuthorizationsApiSagas;
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
    const members :?Map = yield select((s) => s.getIn([ORGANIZATIONS, MEMBERS, organizationId]));
    const entitySets :?Map = yield select((s) => s.getIn([ORGANIZATIONS, ENTITY_SETS, organizationId]));

    // TODO - figure out how to "expire" stored data
    let getOrganizationCall = call(() => {});
    if (!organization) {
      getOrganizationCall = call(getOrganizationWorker, getOrganization(organizationId));
    }

    // TODO - figure out how to "expire" stored data
    let getOrganizationMembersCall = call(() => {});
    if (!members) {
      getOrganizationMembersCall = call(getOrganizationMembersWorker, getOrganizationMembers(organizationId));
    }

    // TODO - figure out how to "expire" stored data
    let getOrganizationEntitySetsCall = call(() => {});
    if (!entitySets) {
      getOrganizationEntitySetsCall = call(getOrganizationEntitySetsWorker, getOrganizationEntitySets(organizationId));
    }

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
      getAuthorizationsResponse,
    ] :Array<?WorkerResponse> = yield all([
      getOrganizationCall,
      getOrganizationMembersCall,
      getOrganizationEntitySetsCall,
      getAuthorizationsCall,
    ]);

    if (getOrganizationResponse) {
      if (getOrganizationResponse.error) throw getOrganizationResponse.error;
      organization = (new OrganizationBuilder(getOrganizationResponse.data)).build();
    }

    if (getOrganizationMembersResponse && getOrganizationMembersResponse.error) {
      throw getOrganizationMembersResponse.error;
    }

    if (getOrganizationEntitySetsResponse && getOrganizationEntitySetsResponse.error) {
      throw getOrganizationEntitySetsResponse.error;
    }

    let isOwner = false;
    if (getAuthorizationsResponse) {
      if (getAuthorizationsResponse.error) throw getAuthorizationsResponse.error;
      const authorizations :AuthorizationObject[] = getAuthorizationsResponse.data;
      isOwner = authorizations[0].permissions[PermissionTypes.OWNER] === true;
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
