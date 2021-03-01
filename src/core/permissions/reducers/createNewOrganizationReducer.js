/*
 * @flow
 */

import { List, Map } from 'immutable';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { createNewOrganization } from '../../../containers/org/actions';
import { MY_KEYS } from '../../redux/constants';

export default function reducer(state :Map, action :SequenceAction) {

  return createNewOrganization.reducer(state, action, {
    SUCCESS: () => {
      const keys :List<UUID> = List().push(List([action.value.id]));
      return state.mergeIn([MY_KEYS], keys);
    },
  });
}
