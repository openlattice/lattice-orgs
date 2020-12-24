/*
 * @flow
 */

import _get from 'lodash/get';
import { Map, getIn, isImmutable } from 'immutable';
import type { EntitySet } from 'lattice';

export default function getDataSetField(dataSet :EntitySet | Map, field :string) :any {

  if (isImmutable(dataSet)) {
    return getIn(dataSet, ['table', field]);
  }

  return _get(dataSet, field);
}
