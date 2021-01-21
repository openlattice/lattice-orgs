/*
 * @flow
 */

import { Map } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import { EDM, METADATA } from '../constants';

const { isValidUUID } = ValidationUtils;

export default function selectDataSetMetaData(dataSetId :UUID) {

  return (state :Map) :Map => {

    if (isValidUUID(dataSetId)) {
      return state.getIn([EDM, METADATA, dataSetId]) || Map();
    }

    return Map();
  };
}
