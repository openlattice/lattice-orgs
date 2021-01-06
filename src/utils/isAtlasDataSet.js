/*
 * @flow
 */

import { Map, has } from 'immutable';
import type { EntitySet } from 'lattice';

export default function isAtlasDataSet(dataSet :EntitySet | Map) :boolean {

  return has(dataSet, 'table');
}
