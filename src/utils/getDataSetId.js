/*
 * @flow
 */

import { Map, getIn } from 'immutable';
import type { EntitySet, UUID } from 'lattice';

export default function getDataSetId(dataSet :EntitySet | Map) :UUID {

  return dataSet.id || getIn(dataSet, ['table', 'id']);
}
