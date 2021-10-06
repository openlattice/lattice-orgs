/*
 * @flow
 */

import _get from 'lodash/get';
import { get, isImmutable } from 'immutable';

import { DATA_SET_TYPE, DataSetTypes } from '../constants';

export default function isEntitySet(dataSet :any) :boolean {

  return isImmutable(dataSet)
    ? get(dataSet, DATA_SET_TYPE) === DataSetTypes.ENTITY_SET
    : _get(dataSet, DATA_SET_TYPE) === DataSetTypes.ENTITY_SET;
}
