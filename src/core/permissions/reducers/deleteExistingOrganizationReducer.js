/*
 * @flow
 */

import { List, Map } from 'immutable';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { deleteExistingOrganization } from '../../../containers/org/actions';
import { MY_KEYS } from '../../redux/constants';

export default function reducer(state :Map, action :SequenceAction) {

  return deleteExistingOrganization.reducer(state, action, {
    SUCCESS: () => {
      const key :List<UUID> = List([action.value]);
      return state.deleteIn([MY_KEYS], key);
    },
  });
}
