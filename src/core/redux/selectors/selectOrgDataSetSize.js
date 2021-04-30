/*
 * @flow
 */

import { Map, getIn } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import { EDM, ENTITY_SET_SIZE_MAP } from '../constants';

const { isValidUUID } = ValidationUtils;

export default function selectOrgDataSetSize(organizationId :UUID, dataSetId :UUID) {

  return (state :Map) :?number => {

    if (isValidUUID(organizationId) && isValidUUID(dataSetId)) {
      const dataSetSize :number = getIn(state, [EDM, ENTITY_SET_SIZE_MAP, organizationId, dataSetId]) || undefined;
      return dataSetSize;
    }

    return undefined;
  };
}
