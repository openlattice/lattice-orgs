/*
 * @flow
 */

import { Map, getIn } from 'immutable';

import { ERROR } from '../constants';
import type { SagaError } from '../../../types';

export default function selectError(actionPath :string[]) {
  const errorPath = actionPath.concat(ERROR);
  return (state :Map) :SagaError => getIn(state, errorPath) || {};
}
