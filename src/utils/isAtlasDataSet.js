/*
 * @flow
 */

import _get from 'lodash/get';
import _has from 'lodash/has';
import {
  Map,
  getIn,
  has,
  isImmutable,
} from 'immutable';

import { FQNS } from '../core/edm/constants';

export default function isAtlasDataSet(dataSet :Object | Map) :boolean {

  if (isImmutable(dataSet)) {
    return has(dataSet, 'table') || getIn(dataSet, [FQNS.OL_STANDARDIZED.toString(), 0]) === false;
  }

  return _has(dataSet, 'table') || _get(dataSet, [FQNS.OL_STANDARDIZED.toString(), 0]) === false;
}
