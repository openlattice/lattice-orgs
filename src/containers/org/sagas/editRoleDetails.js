// @flow

import {
  all,
  call,
  put,
  takeEvery
} from '@redux-saga/core/effects';
import { OrganizationsApiActions, OrganizationsApiSagas } from 'lattice-sagas';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { SequenceAction } from 'redux-reqseq';

import { EDIT_ROLE_DETAILS, editRoleDetails } from '../actions';

const { updateRoleDescriptionWorker, updateRoleTitleWorker } = OrganizationsApiSagas;
const { updateRoleDescription, updateRoleTitle } = OrganizationsApiActions;
const LOG = new Logger('OrgSagas');

function* editRoleDetailsWorker(action :SequenceAction) :Saga<void> {
  try {
    yield put(editRoleDetails.request(action.id, action.value));

    const {
      title,
      description,
      roleId,
      organizationId
    } = action.value;

    const titleRequest = call(
      updateRoleTitleWorker,
      updateRoleTitle({
        organizationId,
        roleId,
        title,
      }),
    );

    const descriptionRequest = call(
      updateRoleDescriptionWorker,
      updateRoleDescription({
        description,
        roleId,
        organizationId,
      }),
    );

    const [descriptionResponse, titleResponse] = yield all([descriptionRequest, titleRequest]);
    if (descriptionResponse.error) throw descriptionResponse.error;
    if (titleResponse.error) throw titleResponse.error;

    yield put(editRoleDetails.success(action.id, action.value));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(editRoleDetails.failure(action.id));
  }
  finally {
    yield put(editRoleDetails.finally(action.id));
  }
}

function* editRoleDetailsWatcher() :Saga<void> {
  yield takeEvery(EDIT_ROLE_DETAILS, editRoleDetailsWorker);
}

export {
  editRoleDetailsWatcher,
  editRoleDetailsWorker,
};
