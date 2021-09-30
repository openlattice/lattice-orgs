// @flow

import {
  all,
  call,
  put,
  takeEvery
} from '@redux-saga/core/effects';
import { Map } from 'immutable';
import { OrganizationsApiActions, OrganizationsApiSagas } from 'lattice-sagas';
import { LangUtils, Logger, ValidationUtils } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { Role, UUID } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { REVOKE_ROLES_FROM_MEMBERS, revokeRolesFromMembers } from '../actions';

const { isDefined } = LangUtils;

const { removeRoleFromMember } = OrganizationsApiActions;
const { removeRoleFromMemberWorker } = OrganizationsApiSagas;
const { isValidUUID } = ValidationUtils;

const LOG = new Logger('OrgsSagas');

function* revokeRolesFromMembersWorker(action :SequenceAction) :Saga<void> {

  try {
    yield put(revokeRolesFromMembers.request(action.id, action.value));

    const {
      organizationId,
      roles,
      members,
    } :{|
      organizationId :UUID;
      roles :Map<UUID, Role>;
      members :Map<string, Map>;
    |} = action.value;

    if (!isValidUUID(organizationId)) {
      throw new Error('organizationId must be a valid UUID');
    }

    const allRevokeRequests = [];
    members.forEach((member :Map, memberId :string) => {
      roles.forEach((role :Role, roleId :UUID) => {
        const assignment = call(removeRoleFromMemberWorker, removeRoleFromMember({
          memberId,
          organizationId,
          roleId,
        }));
        allRevokeRequests.push(assignment);
      });
    });

    const responses :WorkerResponse[] = yield all(allRevokeRequests);
    const responseError = responses.reduce(
      (error :any, r :Object) => (isDefined(error) ? error : r.error),
      undefined,
    );
    if (responseError) throw responseError;

    yield put(revokeRolesFromMembers.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(revokeRolesFromMembers.failure(action.id));
  }
  finally {
    yield put(revokeRolesFromMembers.finally(action.id));
  }
}

function* revokeRolesFromMembersWatcher() :Saga<void> {

  yield takeEvery(REVOKE_ROLES_FROM_MEMBERS, revokeRolesFromMembersWorker);
}

export {
  revokeRolesFromMembersWatcher,
  revokeRolesFromMembersWorker,
};
