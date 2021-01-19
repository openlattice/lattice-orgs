/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { Map, get, getIn } from 'immutable';
import { AuthUtils } from 'lattice-auth';
import { LangUtils, Logger } from 'lattice-utils';
import { DateTime } from 'luxon';
import { v4 as uuid } from 'uuid';
import type { Saga } from '@redux-saga/core';
import type { FQN, PropertyType, UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { submitDataGraph } from '../../../core/data/actions';
import { submitDataGraphWorker } from '../../../core/data/sagas';
import { FQNS } from '../../../core/edm/constants';
import { selectPropertyTypes } from '../../../core/redux/selectors';
import { toSagaError } from '../../../utils';
import { ERR_INVALID_PRINCIPAL_ID } from '../../../utils/constants/errors';
import { SUBMIT_DATA_SET_ACCESS_REQUEST, submitDataSetAccessRequest } from '../actions';
import { DataSetAccessRequestSchema } from '../schemas';

const LOG = new Logger('RequestsSagas');

const { isNonEmptyString } = LangUtils;

const {
  ACCESS_REQUEST_EAK,
  ACCESS_REQUEST_PSK,
  DATA_SET_PROPERTIES,
  PERMISSION_TYPES,
} = DataSetAccessRequestSchema;

function* submitDataSetAccessRequestWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(submitDataSetAccessRequest.request(action.id, action.value));

    const {
      data,
      dataSetId,
      // organizationId,
      schema,
    } :{
      data :Object;
      dataSetId :UUID;
      organizationId :UUID;
      schema :{|
        dataSchema :Object;
        uiSchema :Object;
      |};
    } = action.value;

    const userId :string = get(AuthUtils.getUserInfo(), 'id', '');
    if (!isNonEmptyString(userId)) {
      throw new Error(ERR_INVALID_PRINCIPAL_ID);
    }

    const propertyTypes :Map<UUID, PropertyType> = yield select(selectPropertyTypes([
      FQNS.OL_ACL_KEYS,
      FQNS.OL_ID,
      FQNS.OL_PERMISSION_TYPES,
      FQNS.OL_REQUEST_DATE_TIME,
      FQNS.OL_REQUEST_PRINCIPAL_ID,
      FQNS.OL_SCHEMA,
      FQNS.OL_TEXT,
    ]));

    const propertyTypeIds :Map<FQN, UUID> = propertyTypes
      .mapKeys((id :UUID, propertyType :PropertyType) => propertyType.type)
      .map((propertyType :PropertyType) => propertyType.id);

    const keys :UUID[][] = [];
    getIn(data, [ACCESS_REQUEST_PSK, ACCESS_REQUEST_EAK, DATA_SET_PROPERTIES], []).forEach((propertyId :UUID) => {
      keys.push([dataSetId, propertyId]);
    });

    const permissionTypes = getIn(data, [ACCESS_REQUEST_PSK, ACCESS_REQUEST_EAK, PERMISSION_TYPES], []);

    /*
     * ol.accessrequest
     *   ol.id
     *   ol.text = the RJSF "form data" object as a JSON string
     *   ol.schema = the RJSF data schema and ui schema as a JSON string
     *   ol.aclkeys = acl keys being requested
     *   ol.permissiontypes = permission types being requested
     *   ol.requestdatetime = datetime the request was submitted
     *   ol.requestprincipalid = principal of user requesting access
     */
    const ACCESS_REQUESTS_ESID = '279ef887-9a9e-4954-9ab8-b529bc0d732a';
    const accessRequestEntityData = {
      [get(propertyTypeIds, FQNS.OL_ACL_KEYS)]: [JSON.stringify(keys)],
      [get(propertyTypeIds, FQNS.OL_ID)]: [uuid()],
      [get(propertyTypeIds, FQNS.OL_PERMISSION_TYPES)]: permissionTypes,
      [get(propertyTypeIds, FQNS.OL_REQUEST_DATE_TIME)]: [DateTime.local().toISO()],
      [get(propertyTypeIds, FQNS.OL_REQUEST_PRINCIPAL_ID)]: [userId],
      [get(propertyTypeIds, FQNS.OL_SCHEMA)]: [JSON.stringify(schema)],
      [get(propertyTypeIds, FQNS.OL_TEXT)]: [JSON.stringify(data)],
    };

    const entityData = {
      [ACCESS_REQUESTS_ESID]: [accessRequestEntityData],
    };

    const response = yield call(
      submitDataGraphWorker,
      // NOTE: we don't have to work with associations at the moment but will most likely need to in the near future
      submitDataGraph({ entityData }),
    );
    if (response.error) throw response.error;

    yield put(submitDataSetAccessRequest.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(submitDataSetAccessRequest.failure(action.id, toSagaError(error)));
  }
  finally {
    yield put(submitDataSetAccessRequest.finally(action.id));
  }
}

function* submitDataSetAccessRequestWatcher() :Saga<*> {

  yield takeEvery(SUBMIT_DATA_SET_ACCESS_REQUEST, submitDataSetAccessRequestWorker);
}

export {
  submitDataSetAccessRequestWatcher,
  submitDataSetAccessRequestWorker,
};
