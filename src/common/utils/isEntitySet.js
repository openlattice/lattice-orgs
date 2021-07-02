/*
 * @flow
 */

import _get from 'lodash/get';
import { get, isImmutable } from 'immutable';

import { DATA_SET_TYPE } from '../constants';

export default function isEntitySet(dataSet :any) :boolean {

  return isImmutable(dataSet)
    ? get(dataSet, DATA_SET_TYPE) === 'EntitySet'
    : _get(dataSet, DATA_SET_TYPE) === 'EntitySet';
}
