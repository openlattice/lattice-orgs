/*
 * @flow
 */

import _get from 'lodash/get';
import { Map, get, isImmutable } from 'immutable';

export default function isAtlasDataSet(dataSet :Object | Map) :boolean {
  return isImmutable(dataSet)
    ? get(dataSet, 'dataSetType') === 'ExternalTable'
    : _get(dataSet, 'dataSetType') === 'ExternalTable';
}
