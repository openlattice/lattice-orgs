/*
 * @flow
 */

import {
  all,
  call,
  delay,
  put,
  takeEvery,
  takeLatest,
} from '@redux-saga/core/effects';
import {
  List,
  Map,
  fromJS,
} from 'immutable';
import {
  OrganizationsApiActions,
  OrganizationsApiSagas,
  PrincipalsApiActions,
  PrincipalsApiSagas,
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { isValidUUID } from '../../utils/ValidationUtils';
import {
  GET_ORGANIZATION_DETAILS,
  SEARCH_MEMBERS_TO_ADD_TO_ORG,
  getOrganizationDetails,
  searchMembersToAddToOrg,
} from './OrgsActions';

const LOG = new Logger('OrgsSagas');

const {
  getOrganization,
  getOrganizationMembers,
} = OrganizationsApiActions;
const {
  getOrganizationWorker,
  getOrganizationMembersWorker,
} = OrganizationsApiSagas;
const { searchAllUsers } = PrincipalsApiActions;
const { searchAllUsersWorker } = PrincipalsApiSagas;

/*
 *
 * OrgsActions.getOrganizationDetails
 *
 */

function* getOrganizationDetailsWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(getOrganizationDetails.request(action.id, action.value));

    const organizationId :UUID = action.value;
    if (!isValidUUID(organizationId)) {
      throw new Error('organizationId must be a valid UUID');
    }

    const [orgResponse, orgMembersResponse] = yield all([
      call(getOrganizationWorker, getOrganization(organizationId)),
      call(getOrganizationMembersWorker, getOrganizationMembers(organizationId)),
    ]);
    if (orgResponse.error) throw orgResponse.error;
    if (orgMembersResponse.error) throw orgMembersResponse.error;

    const org :Map = fromJS(orgResponse.data);
    const orgMembers :List = fromJS(orgMembersResponse.data);
    const orgWithMembers :Map = org.set('members', orgMembers);

    yield put(getOrganizationDetails.success(action.id, orgWithMembers));
  }
  catch (error) {
    LOG.error('getOrganizationDetailsWorker()', error);
    yield put(getOrganizationDetails.failure(action.id));
  }
  finally {
    yield put(getOrganizationDetails.finally(action.id));
  }
}

function* getOrganizationDetailsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_ORGANIZATION_DETAILS, getOrganizationDetailsWorker);
}

/*
 *
 * OrgsActions.searchMembersToAddToOrg
 *
 */

function* searchMembersToAddToOrgWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(searchMembersToAddToOrg.request(action.id, action.value));

    const { organizationId, query } = action.value;
    if (!isValidUUID(organizationId)) {
      throw new Error('organizationId must be a valid UUID');
    }

    yield delay(1000);

    let searchResults = List();
    if (query.length > 1) {
      const response = yield call(searchAllUsersWorker, searchAllUsers(query));
      if (response.error) throw response.error;
      searchResults = fromJS(response.data);
    }
    yield put(searchMembersToAddToOrg.success(action.id, searchResults));
  }
  catch (error) {
    LOG.error('searchMembersToAddToOrgWorker()', error);
    yield put(searchMembersToAddToOrg.failure(action.id));
  }
  finally {
    yield put(searchMembersToAddToOrg.finally(action.id));
  }
}

function* searchMembersToAddToOrgWatcher() :Generator<*, *, *> {

  yield takeLatest(SEARCH_MEMBERS_TO_ADD_TO_ORG, searchMembersToAddToOrgWorker);
}

// const { getAppConfigs } = AppApiActions;
// const { getAppConfigsWorker } = AppApiSagas;
//
// /*
//  *
//  * OrgsActions.getRelevantEntitySets()
//  *
//  */
//
// function* getRelevantEntitySetsWorker(action :SequenceAction) :Generator<*, *, *> {
//
//   const { id, value } = action;
//   if (value === null || value === undefined) {
//     yield put(getRelevantEntitySets.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
//     return;
//   }
//
//   const organization :Map = value;
//   let response :Object = {};
//
//   try {
//     yield put(getRelevantEntitySets.request(action.id));
//     const appIds :UUID[] = organization.get('apps').toJS();
//     const organizationId :UUID = organization.get('id');
//     const appConfigsCalls = appIds.map((appId :UUID) => call(getAppConfigsWorker, getAppConfigs(appId)));
//     response = yield all(appConfigsCalls);
//     const appConfigsMultipleApps :List<List<Map>> = fromJS(response).map(
//       (appConfigsResponse :Map) => (appConfigsResponse.has('error') ? Map() : appConfigsResponse.get('data'))
//     );
//
//     const appIdToEntitySetIdsMap :Map<UUID, Set<UUID>> = Map().withMutations((map :Map<UUID, Set<UUID>>) => {
//       appConfigsMultipleApps.forEach((appConfigsSingleApp :List<Map>) => {
//         appConfigsSingleApp
//           .filter((appConfig :Map) => appConfig.getIn(['organization', 'id']) === organizationId)
//           .forEach((appConfig :Map) => {
//             const appId :UUID = appConfig.get('id');
//             const entitySetIds :Set<UUID> = Set().withMutations((set :Set<UUID>) => {
//               appConfig.get('config', Map()).valueSeq().forEach((settings :Map) => {
//                 const entitySetId :UUID = settings.get('entitySetId');
//                 if (isValidUUID(entitySetId)) {
//                   set.add(entitySetId);
//                 }
//               });
//             });
//             map.set(appId, entitySetIds);
//           });
//       });
//     });
//
//     yield put(getRelevantEntitySets.success(action.id, { appIdToEntitySetIdsMap }));
//   }
//   catch (error) {
//     LOG.error('caught exception in initializeApplicationWorker()', error);
//     yield put(getRelevantEntitySets.failure(action.id, error));
//   }
//   finally {
//     yield put(getRelevantEntitySets.finally(action.id));
//   }
// }
//
// function* getRelevantEntitySetsWatcher() :Generator<*, *, *> {
//
//   yield takeEvery(GET_RELEVANT_ENTITY_SETS, getRelevantEntitySetsWorker);
// }

export {
  getOrganizationDetailsWatcher,
  getOrganizationDetailsWorker,
  searchMembersToAddToOrgWatcher,
  searchMembersToAddToOrgWorker,
};
