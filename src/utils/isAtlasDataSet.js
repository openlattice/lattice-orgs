/*
 * @flow
 */

import { Map, getIn, has } from 'immutable';

import { FQNS } from '../core/edm/constants';

export default function isAtlasDataSet(dataSet :Map) :boolean {

  return has(dataSet, 'table') || getIn(dataSet, [FQNS.OL_STANDARDIZED, 0]) === false;
}
