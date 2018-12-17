/*
 * @flow
 */

import { push } from 'react-router-redux';
import { put, takeEvery } from 'redux-saga/effects';

import Logger from '../../utils/Logger';
import * as Routes from '../../core/router/Routes';
import { SWITCH_ORGANIZATION } from './OrgsActions';
import { storeOrganizationId } from './OrgsUtils';
import { isValidUUID } from '../../utils/ValidationUtils';

const LOG = new Logger('OrgsSagas');

/*
 *
 * OrgsActions.switchOrganization()
 *
 */

function* switchOrganizationWorker(action :Object) :Generator<*, *, *> {

  if (!action.orgId || !isValidUUID(action.orgId)) {
    LOG.warn('switchOrganizationWorker() : orgId must be a valid UUID', action.orgId);
    return;
  }

  storeOrganizationId(action.orgId);
  yield put(push(Routes.ORG.replace(':id', action.orgId)));
}

function* switchOrganizationWatcher() :Generator<*, *, *> {

  yield takeEvery(SWITCH_ORGANIZATION, switchOrganizationWorker);
}

export {
  switchOrganizationWatcher,
  switchOrganizationWorker,
};
