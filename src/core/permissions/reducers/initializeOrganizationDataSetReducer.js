/*
 * @flow
 */

import { List, Map, get } from 'immutable';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { initializeOrganizationDataSet } from '../../edm/actions';
import { DATA_SET, IS_OWNER, MY_KEYS } from '../../redux/constants';

export default function reducer(state :Map, action :SequenceAction) {

  return initializeOrganizationDataSet.reducer(state, action, {
    SUCCESS: () => {
      if (action.value[IS_OWNER] === true) {
        const dataSetId :UUID = get(action.value[DATA_SET], 'id');
        const keys :List<List<UUID>> = List().push(List([dataSetId]));
        return state.mergeIn([MY_KEYS], keys);
      }
      return state;
    },
  });
}
