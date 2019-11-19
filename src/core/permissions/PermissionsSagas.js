/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map } from 'immutable';
import { Models, Types } from 'lattice';
import { PermissionsApiActions, PermissionsApiSagas } from 'lattice-sagas';
import type { ActionType, PermissionType } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import {
  UPDATE_USER_PERMISSION,
  updateUserPermission,
} from './PermissionsActions';

const LOG = new Logger('OrgsSagas');

const {
  Ace,
  AceBuilder,
  Acl,
  AclBuilder,
  AclData,
  AclDataBuilder,
  Principal,
  PrincipalBuilder,
} = Models;

const {
  ActionTypes,
  PermissionTypes,
  PrincipalTypes,
} = Types;

const { updateAcls } = PermissionsApiActions;
const { updateAclsWorker } = PermissionsApiSagas;

/*
 *
 * OrgsActions.updateUserPermission
 *
 */

function* updateUserPermissionWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(updateUserPermission.request(action.id, action.value));

    const aclKeys :List<List<UUID>> = action.value.aclKeys;
    const actionType :ActionType = action.value.actionType;
    const permissionType :PermissionType = action.value.permissionType;
    const userId :string = action.value.userId;

    if (!ActionTypes[actionType]) {
      throw new Error(`invalid ActionType - ${actionType}`);
    }

    if (!PermissionTypes[permissionType]) {
      throw new Error(`invalid PermissionType - ${permissionType}`);
    }

    const users :Map = yield select((state :Map) => state.getIn(['users', 'users'], Map()));
    if (!users.has(userId)) {
      // it is possible for user permissions to exist even if the user does not, for example, when a user has
      // deleted their account or has been removed from Auth0. these "zombie permissions" should still be
      // removeable, so we'll still make the request and let the backend respond with an error
      LOG.error('invalid user id', userId);
    }

    const permissions = actionType === ActionTypes.ADD && permissionType === PermissionTypes.OWNER
      ? [
        PermissionTypes.OWNER,
        PermissionTypes.WRITE,
        PermissionTypes.READ,
        PermissionTypes.LINK,
        PermissionTypes.DISCOVER,
      ]
      : [permissionType];

    const updates :AclData[] = [];

    aclKeys.forEach((aclKey :List<UUID>) => {

      const principal :Principal = (new PrincipalBuilder())
        .setId(userId)
        .setType(PrincipalTypes.USER)
        .build();

      const ace :Ace = (new AceBuilder())
        .setPermissions(permissions)
        .setPrincipal(principal)
        .build();

      const acl :Acl = (new AclBuilder())
        .setAces([ace])
        .setAclKey(aclKey.toJS())
        .build();

      const aclData :AclData = (new AclDataBuilder())
        .setAcl(acl)
        .setAction(actionType)
        .build();

      updates.push(aclData);
    });

    const response = yield call(updateAclsWorker, updateAcls(updates));
    if (response.error) throw response.error;

    yield put(updateUserPermission.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(updateUserPermission.failure(action.id));
  }
  finally {
    yield put(updateUserPermission.finally(action.id));
  }
}

function* updateUserPermissionWatcher() :Generator<*, *, *> {

  yield takeEvery(UPDATE_USER_PERMISSION, updateUserPermissionWorker);
}

export {
  updateUserPermissionWatcher,
  updateUserPermissionWorker,
};
