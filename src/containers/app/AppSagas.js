/*
 * @flow
 */

import {
  all,
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import {
  EntitySetsApiActions,
  EntitySetsApiSagas,
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { INITIALIZE_APPLICATION, initializeApplication } from './AppActions';
import { getOrgsAndPermissions } from '../orgs/OrgsActions';
import { getOrgsAndPermissionsWorker } from '../orgs/OrgsSagas';
import { getEntityDataModelTypes } from '../../core/edm/EDMActions';
import { getEntityDataModelTypesWorker } from '../../core/edm/EDMSagas';

const LOG = new Logger('AppSagas');

const { getAllEntitySets } = EntitySetsApiActions;
const { getAllEntitySetsWorker } = EntitySetsApiSagas;


/*
 *
 * AppActions.initializeApplication()
 *
 */

function* initializeApplicationWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(initializeApplication.request(action.id));
    const responses :Object[] = yield all([
      call(getEntityDataModelTypesWorker, getEntityDataModelTypes()),
      call(getOrgsAndPermissionsWorker, getOrgsAndPermissions()),
      call(getAllEntitySetsWorker, getAllEntitySets()),
    ]);
    if (responses[0].error) throw responses[0].error;
    if (responses[1].error) throw responses[1].error;

    // do not block the app from loading if getAllEntitySets() fails. handling this error can be done in the container
    // responsible for rendering an organization's EntitySets
    if (responses[2].error) {
      LOG.error(action.type, responses[2].error);
    }

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
