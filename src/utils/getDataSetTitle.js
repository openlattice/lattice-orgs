/*
 * @flow
 */

import { Map, getIn } from 'immutable';
import type { EntitySet } from 'lattice';

export default function getDataSetTitle(dataSet :EntitySet | Map) :string {

  return dataSet.title || getIn(dataSet, ['table', 'title']);
}
