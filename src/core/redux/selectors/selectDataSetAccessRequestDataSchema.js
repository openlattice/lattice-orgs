/*
 * @flow
 */

import { Map, getIn } from 'immutable';

import { ACCESS_REQUEST_DATA_SCHEMA, REQUESTS } from '../constants';

export default function selectDataSetAccessRequestDataSchema() {

  return (state :Map) :?Object => getIn(state, [REQUESTS, ACCESS_REQUEST_DATA_SCHEMA]);
}
