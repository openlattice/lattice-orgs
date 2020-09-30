/*
 * @flow
 */

import {
  List,
  Map,
  getIn,
  hasIn,
} from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import { MEMBERS, ORGANIZATIONS } from '../constants';

const { isValidUUID } = ValidationUtils;

export default function selectOrganizationMembers(organizationId :?UUID) {

  return (state :Map) :List => {

    if (isValidUUID(organizationId)) {
      if (hasIn(state, [ORGANIZATIONS, MEMBERS, organizationId])) {
        return getIn(state, [ORGANIZATIONS, MEMBERS, organizationId]);
      }
    }

    return List();
  };
}
