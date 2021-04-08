/*
 * @flow
 */

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

import { EDIT_ORGANIZATION_DETAILS, editOrganizationDetails } from '../actions';

const { updateOrganizationTitleWorker, updateOrganizationDescriptionWorker } = OrganizationsApiSagas;
const { updateOrganizationTitle, updateOrganizationDescription } = OrganizationsApiActions;

const LOG = new Logger('OrgSagas');

function* editOrganizationDetailsWorker(action :SequenceAction) :Saga<void> {
  try {
    yield put(editOrganizationDetails.request(action.id, action.value));

    const { title, description, organizationId } = action.value;

    const titleRequest = call(
      updateOrganizationTitleWorker,
      updateOrganizationTitle({
        organizationId,
        title,
      }),
    );

    const descriptionRequest = call(
      updateOrganizationDescriptionWorker,
      updateOrganizationDescription({
        description,
        organizationId,
      }),
    );

    const [descriptionResponse, titleResponse] = yield all([descriptionRequest, titleRequest]);
    if (descriptionResponse.error) throw descriptionResponse.error;
    if (titleResponse.error) throw titleResponse.error;

    yield put(editOrganizationDetails.success(action.id, action.value));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(editOrganizationDetails.failure(action.id));
  }
  finally {
    yield put(editOrganizationDetails.finally(action.id));
  }
}

function* editOrganizationDetailsWatcher() :Saga<void> {
  yield takeEvery(EDIT_ORGANIZATION_DETAILS, editOrganizationDetailsWorker);
}

export {
  editOrganizationDetailsWatcher,
  editOrganizationDetailsWorker,
};
