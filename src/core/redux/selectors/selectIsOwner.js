/*
 * @flow
 */

import { Map, getIn } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import { IS_OWNER, PERMISSIONS } from '../constants';

const { isValidUUID } = ValidationUtils;

export default function selectIsOwner(id :UUID) {

  return (state :Map) :boolean => {

    if (isValidUUID(id)) {
      return getIn(state, [PERMISSIONS, IS_OWNER, id]);
    }

    return false;
  };
}
