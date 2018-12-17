/*
 * @flow
 */

import {
  List,
  Map,
  Set,
  fromJS,
} from 'immutable';
import { AppApiActions, AppApiSagas } from 'lattice-sagas';
import { push } from 'react-router-redux';
import {
  all,
  call,
  put,
  takeEvery,
} from 'redux-saga/effects';

import Logger from '../../utils/Logger';
import * as Routes from '../../core/router/Routes';
import { storeOrganizationId } from './OrgsUtils';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { isValidUUID } from '../../utils/ValidationUtils';
import {
  GET_RELEVANT_ENTITY_SETS,
  SWITCH_ORGANIZATION,
  getRelevantEntitySets,
} from './OrgsActions';

const LOG = new Logger('OrgsSagas');

const { getAppConfigs } = AppApiActions;
const { getAppConfigsWorker } = AppApiSagas;

/*
 *
 * OrgsActions.getRelevantEntitySets()
 *
 */

function* getRelevantEntitySetsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (value === null || value === undefined) {
    yield put(getRelevantEntitySets.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }

  const organization :Map = value;
  let response :Object = {};

  try {
    yield put(getRelevantEntitySets.request(action.id));
    const appIds :UUID[] = organization.get('apps').toJS();
    const organizationId :UUID = organization.get('id');
    const appConfigsCalls = appIds.map((appId :UUID) => call(getAppConfigsWorker, getAppConfigs(appId)));
    response = yield all(appConfigsCalls);
    const appConfigsMultipleApps :List<List<Map>> = fromJS(response).map(
      (appConfigsResponse :Map) => (appConfigsResponse.has('error') ? Map() : appConfigsResponse.get('data'))
    );

    const appIdToEntitySetIdsMap :Map<UUID, Set<UUID>> = Map().withMutations((map :Map<UUID, Set<UUID>>) => {
      appConfigsMultipleApps.forEach((appConfigsSingleApp :List<Map>) => {
        appConfigsSingleApp
          .filter((appConfig :Map) => appConfig.getIn(['organization', 'id']) === organizationId)
          .forEach((appConfig :Map) => {
            const appId :UUID = appConfig.get('id');
            const entitySetIds :Set<UUID> = Set().withMutations((set :Set<UUID>) => {
              appConfig.get('config', Map()).valueSeq().forEach((settings :Map) => {
                const entitySetId :UUID = settings.get('entitySetId');
                if (isValidUUID(entitySetId)) {
                  set.add(entitySetId);
                }
              });
            });
            map.set(appId, entitySetIds);
          });
      });
    });

    yield put(getRelevantEntitySets.success(action.id, { appIdToEntitySetIdsMap }));
  }
  catch (error) {
    LOG.error('caught exception in initializeApplicationWorker()', error);
    yield put(getRelevantEntitySets.failure(action.id, error));
  }
  finally {
    yield put(getRelevantEntitySets.finally(action.id));
  }
}

function* getRelevantEntitySetsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_RELEVANT_ENTITY_SETS, getRelevantEntitySetsWorker);
}

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
  getRelevantEntitySetsWatcher,
  getRelevantEntitySetsWorker,
  switchOrganizationWatcher,
  switchOrganizationWorker,
};
