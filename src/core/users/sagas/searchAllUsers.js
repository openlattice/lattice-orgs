/*
 * @flow
 */

import isEmail from 'validator/lib/isEmail';
import { call, put, takeEvery } from '@redux-saga/core/effects';
import { PrincipalsApiActions, PrincipalsApiSagas } from 'lattice-sagas';
import { AxiosUtils, LangUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { SEARCH_ALL_USERS, searchAllUsers } from '../actions';

const { searchUsers } = PrincipalsApiActions;
const { searchUsersWorker } = PrincipalsApiSagas;
const { toSagaError } = AxiosUtils;
const { isNonEmptyString } = LangUtils;

const LOG = new Logger('UsersSagas');

function* searchAllUsersWorker(action :SequenceAction) :Saga<void> {

  try {
    yield put(searchAllUsers.request(action.id, action.value));

    if (action.value === '*') {
      throw new Error('search query cannot be "*"');
    }
    if (!isNonEmptyString(action.value)) {
      throw new Error('search query cannot be empty');
    }

    let fields = {};
    const query :string = action.value;
    const wildcard :boolean = query.includes('*');

    // NOTE - these checks are not meant to be super strict/advanced at the moment
    if (!wildcard && isEmail(query)) {
      // EXACT email search, make sure there's no "*"
      fields = { email: `"${query}"` };
    }
    else if (query.includes('@') || query.includes('.')) {
      // "test@", "test."
      fields = { email: wildcard ? query : `${query}*` };
    }
    else {
      fields = { name: wildcard ? query : `${query}*` };
    }

    const response :WorkerResponse = yield call(searchUsersWorker, searchUsers(fields));
    if (response.error) throw response.error;

    yield put(searchAllUsers.success(action.id, response.data));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(searchAllUsers.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(searchAllUsers.finally(action.id));
  }
}

function* searchAllUsersWatcher() :Saga<*> {

  yield takeEvery(SEARCH_ALL_USERS, searchAllUsersWorker);
}

export {
  searchAllUsersWatcher,
  searchAllUsersWorker,
};
