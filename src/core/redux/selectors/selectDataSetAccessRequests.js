/*
 * @flow
 */

import { List, Map } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import { ACCESS_REQUESTS, REQUESTS } from '../constants';

const { isValidUUID } = ValidationUtils;

export default function selectDataSetAccessRequests(dataSetId :UUID) {

  return (state :Map) :List => {

    if (isValidUUID(dataSetId)) {
      return state.getIn([REQUESTS, ACCESS_REQUESTS, dataSetId]) || List();
    }

    return List();
  };
}
