/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { OrganizationsApiActions, OrganizationsApiSagas } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { INITIALIZE_APPLICATION, initializeApplication } from './AppActions';

const LOG = new Logger('AppSagas');

const { getAllOrganizations } = OrganizationsApiActions;
const { getAllOrganizationsWorker } = OrganizationsApiSagas;

/*
 *
 * AppActions.initializeApplication()
 *
 */

function* initializeApplicationWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(initializeApplication.request(action.id));
    yield call(getAllOrganizationsWorker, getAllOrganizations());
    yield put(initializeApplication.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(initializeApplication.failure(action.id, error));
  }
  finally {
    yield put(initializeApplication.finally(action.id));
  }
}

function* initializeApplicationWatcher() :Generator<*, *, *> {

  yield takeEvery(INITIALIZE_APPLICATION, initializeApplicationWorker);
}

export {
  initializeApplicationWatcher,
  initializeApplicationWorker,
};
