/*
 * @flow
 */

import { Map } from 'immutable';

import { getUserProfileLabel } from '../../../utils/PersonUtils';

export default function sortOrganizationMembers(user1 :Object | Map, user2 :Object | Map) {

  const label1 :string = getUserProfileLabel(user1);
  const label2 :string = getUserProfileLabel(user2);

  if (label1 < label2) {
    return -1;
  }

  if (label1 > label2) {
    return 1;
  }

  return 0;
}
