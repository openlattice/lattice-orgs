/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, Set } from 'immutable';
import { Models } from 'lattice';
import { DataUtils, LangUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type {
  Ace,
  Organization,
  PermissionType,
  Principal,
  PropertyType,
  UUID,
} from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { getPermissionsWorker } from './getPermissions';

import { ERR_MISSING_ORG, ERR_MISSING_PROPERTY_TYPE } from '../../../utils/constants/errors';
import { getOrgDataSetColumnsFromMeta } from '../../edm/actions';
import { FQNS } from '../../edm/constants';
import { getOrgDataSetColumnsFromMetaWorker } from '../../edm/sagas';
import { PAGE_PERMISSIONS_BY_DATA_SET, TOTAL_PERMISSIONS } from '../../redux/constants';
import {
  selectOrgDataSets,
  selectOrgDataSetsColumns,
  selectOrganization,
  selectPrincipalPermissions,
  selectPropertyTypes,
} from '../../redux/selectors';
import { GET_DATA_SET_PERMISSIONS_PAGE, getDataSetPermissionsPage, getPermissions } from '../actions';

const { FQN } = Models;
const { getPropertyValue } = DataUtils;
const { isNonEmptyArray, isNonEmptyString } = LangUtils;

const REQUIRED_PROPERTY_TYPES :FQN[] = [
  FQNS.OL_DATA_SET_ID,
];

const LOG = new Logger('PermissionsSagas');

function* getDataSetPermissionsPageWorker(action :SequenceAction) :Saga<void> {

  try {
    yield put(getDataSetPermissionsPage.request(action.id, action.value));

    const {
      filterByPermissionTypes,
      filterByQuery,
      organizationId,
      pageSize,
      principal,
      start,
    } :{|
      filterByPermissionTypes :Array<PermissionType>;
      filterByQuery :string;
      organizationId :UUID;
      pageSize :number;
      principal :Principal;
      start :number;
    |} = action.value;
    let response :WorkerResponse;

    const organization :?Organization = yield select(selectOrganization(organizationId));
    if (!organization) {
      throw new Error(ERR_MISSING_ORG);
    }

    const propertyTypes :Map<UUID, PropertyType> = yield select(selectPropertyTypes(REQUIRED_PROPERTY_TYPES));
    const propertyTypeIds :Map<FQN, UUID> = propertyTypes.map((propertyType) => propertyType.type).flip();
    if (propertyTypeIds.count() !== REQUIRED_PROPERTY_TYPES.length) {
      throw new Error(ERR_MISSING_PROPERTY_TYPE);
    }

    const dataSets :Map<UUID, Map> = yield select(selectOrgDataSets(organizationId));
    const dataSetKeys :List<List<UUID>> = dataSets.keySeq().map((dataSetId :UUID) => List([dataSetId])).toList();

    // NOTE: this is always getting permissions for all organization data sets, not ideal
    response = yield call(getPermissionsWorker, getPermissions(dataSetKeys));
    if (response.error) throw response.error;

    let permissions :Map<List<UUID>, Ace> = yield select(selectPrincipalPermissions(dataSetKeys, principal));
    if (isNonEmptyString(filterByQuery) || isNonEmptyArray(filterByPermissionTypes)) {
      permissions = permissions.filter((ace :Ace, key :List<UUID>) => {
        const dataSetId :UUID = key.get(0);
        const dataSet :Map = dataSets.get(dataSetId);
        const dataSetTitle :string = getPropertyValue(dataSet, [FQNS.OL_TITLE, 0]);
        return (
          dataSetTitle.toLowerCase().includes(filterByQuery.toLowerCase())
          && filterByPermissionTypes.every((pt :PermissionType) => ace?.permissions.includes(pt))
        );
      });
    }

    // NOTE: these are the data set ids for this page
    const pageDataSetIds :Set<UUID> = permissions
      .slice(start, start + pageSize)
      .keySeq()
      .flatten()
      .toSet();

    if (pageDataSetIds.isEmpty()) {
      yield put(getDataSetPermissionsPage.success(action.id, Map({
        [PAGE_PERMISSIONS_BY_DATA_SET]: Map(),
        [TOTAL_PERMISSIONS]: 0,
      })));
    }
    else {
      // NOTE: this will propulate the redux store so we don't need the response
      yield call(
        getOrgDataSetColumnsFromMetaWorker,
        getOrgDataSetColumnsFromMeta({ dataSetIds: pageDataSetIds, organizationId }),
      );

      const pageDataSetColumns :Map<UUID, List<Map<FQN, List>>> = yield select(
        selectOrgDataSetsColumns(organizationId, pageDataSetIds)
      );
      const pageDataSetColumnKeys :List<List<UUID>> = List().withMutations((mutableList) => {
        pageDataSetColumns.forEach((dataSetColumns :List<Map<FQN, List>>, dataSetId :UUID) => {
          dataSetColumns.forEach((dataSetColumn :Map<FQN, List>) => {
            mutableList.push(
              List([dataSetId, getPropertyValue(dataSetColumn, [FQNS.OL_ID, 0])])
            );
          });
        });
      });

      response = yield call(getPermissionsWorker, getPermissions(pageDataSetColumnKeys));
      if (response.error) throw response.error;

      const pageDataSetKeys :List<List<UUID>> = pageDataSetIds.map((dataSetId :UUID) => List([dataSetId])).toList();
      const pageKeys :List<List<UUID>> = pageDataSetKeys.concat(pageDataSetColumnKeys);

      const pagePermissions :Map<List<UUID>, Ace> = yield select(selectPrincipalPermissions(pageKeys, principal));
      const pagePermissionsByDataSet :Map<UUID, Map<List<UUID>, Ace>> = Map().withMutations((mutableMap) => {
        pagePermissions.forEach((ace :Ace, key) => {
          const dataSetId :UUID = key.get(0);
          mutableMap.mergeIn([dataSetId], Map([[key, ace]]));
        });
      });

      yield put(getDataSetPermissionsPage.success(action.id, Map({
        [PAGE_PERMISSIONS_BY_DATA_SET]: pagePermissionsByDataSet,
        [TOTAL_PERMISSIONS]: permissions.count(),
      })));
    }
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getDataSetPermissionsPage.failure(action.id, error));
  }
  finally {
    yield put(getDataSetPermissionsPage.finally(action.id));
  }
}

function* getDataSetPermissionsPageWatcher() :Saga<*> {

  yield takeEvery(
    GET_DATA_SET_PERMISSIONS_PAGE,
    getDataSetPermissionsPageWorker,
  );
}

export {
  getDataSetPermissionsPageWatcher,
  getDataSetPermissionsPageWorker,
};
