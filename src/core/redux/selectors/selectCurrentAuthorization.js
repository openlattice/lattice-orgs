/*
 * @flow
 */

import {
  List,
  Map,
  getIn
} from 'immutable';
import type { PermissionType } from 'lattice';

import { CURRENT, PERMISSIONS } from '../constants';

export default function selectCurrentAuthorization(acl :List, permission :PermissionType) {

  return (state :Map) :boolean => getIn(state, [PERMISSIONS, CURRENT, acl, permission], false);
}
