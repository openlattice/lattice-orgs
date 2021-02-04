/*
 * @flow
 */

import { Map, getIn } from 'immutable';

import { ACCESS_REQUEST_UI_SCHEMA, REQUESTS } from '../constants';

export default function selectDataSetAccessRequestUISchema() {

  return (state :Map) :?Object => getIn(state, [REQUESTS, ACCESS_REQUEST_UI_SCHEMA]);
}
