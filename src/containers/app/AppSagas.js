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
  PrincipalsApiActions,
  PrincipalsApiSagas,
} from 'lattice-sagas';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { SequenceAction } from 'redux-reqseq';

import { INITIALIZE_APPLICATION, initializeApplication } from './AppActions';

import { getEntityDataModelTypes } from '../../core/edm/EDMActions';
import { getEntityDataModelTypesWorker } from '../../core/edm/EDMSagas';
import { getOrgsAndPermissions } from '../orgs/OrgsActions';
import { getOrgsAndPermissionsWorker } from '../orgs/OrgsSagas';

const LOG = new Logger('AppSagas');

const { getAllEntitySets } = EntitySetsApiActions;
const { getAllEntitySetsWorker } = EntitySetsApiSagas;
const { getAllUsers } = PrincipalsApiActions;
const { getAllUsersWorker } = PrincipalsApiSagas;

/*
 *
 * AppActions.initializeApplication()
 *
 */

function* initializeApplicationWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(initializeApplication.request(action.id));
    const responses :Object[] = yield all([
      call(getEntityDataModelTypesWorker, getEntityDataModelTypes()),
      call(getOrgsAndPermissionsWorker, getOrgsAndPermissions()),
      call(getAllEntitySetsWorker, getAllEntitySets()),
      call(getAllUsersWorker, getAllUsers()),
    ]);
    if (responses[0].error) throw responses[0].error;
    if (responses[1].error) throw responses[1].error;

    // do not block the app from loading if getAllEntitySets() fails
    if (responses[2].error) {
      LOG.error(action.type, responses[2].error);
    }

    // do not block the app from loading if getAllUsers() fails
    if (responses[3].error) {
      LOG.error(action.type, responses[3].error);
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

function* initializeApplicationWatcher() :Saga<*> {

  yield takeEvery(INITIALIZE_APPLICATION, initializeApplicationWorker);
}

export {
  initializeApplicationWatcher,
  initializeApplicationWorker,
};
