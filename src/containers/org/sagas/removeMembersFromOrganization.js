// @flow

import {
  all,
  call,
  put,
  takeEvery
} from '@redux-saga/core/effects';
import { OrganizationsApiActions, OrganizationsApiSagas } from 'lattice-sagas';
import { LangUtils, Logger, ValidationUtils } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { REMOVE_MEMBERS_FROM_ORGANIZATION, removeMembersFromOrganization } from '../actions';

const { isDefined } = LangUtils;

const { removeMemberFromOrganization } = OrganizationsApiActions;
const { removeMemberFromOrganizationWorker } = OrganizationsApiSagas;
const { isValidUUID } = ValidationUtils;

const LOG = new Logger('OrgsSagas');

function* removeMembersFromOrganizationWorker(action :SequenceAction) :Saga<void> {

  try {
    yield put(removeMembersFromOrganization.request(action.id, action.value));

    const {
      organizationId,
      memberIds,
    } :{|
      organizationId :UUID;
      memberIds :UUID[];
    |} = action.value;

    if (!isValidUUID(organizationId)) {
      throw new Error('organizationId must be a valid UUID');
    }

    const allRemoveRequests = [];
    memberIds.forEach((memberId :UUID) => {
      const removeCall = call(removeMemberFromOrganizationWorker, removeMemberFromOrganization({
        memberId,
        organizationId,
      }));
      allRemoveRequests.push(removeCall);
    });

    const responses :WorkerResponse[] = yield all(allRemoveRequests);
    const responseError = responses.reduce(
      (error :any, r :Object) => (isDefined(error) ? error : r.error),
      undefined,
    );
    if (responseError) throw responseError;

    yield put(removeMembersFromOrganization.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(removeMembersFromOrganization.failure(action.id));
  }
  finally {
    yield put(removeMembersFromOrganization.finally(action.id));
  }
}

function* removeMembersFromOrganizationWatcher() :Saga<void> {

  yield takeEvery(REMOVE_MEMBERS_FROM_ORGANIZATION, removeMembersFromOrganizationWorker);
}

export {
  removeMembersFromOrganizationWatcher,
  removeMembersFromOrganizationWorker,
};
