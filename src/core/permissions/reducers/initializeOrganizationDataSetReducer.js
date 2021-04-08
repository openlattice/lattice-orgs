/*
 * @flow
 */

import { List, Map } from 'immutable';
import { DataUtils } from 'lattice-utils';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { initializeOrganizationDataSet } from '../../edm/actions';
import { FQNS } from '../../edm/constants';
import { DATA_SET, IS_OWNER, MY_KEYS } from '../../redux/constants';

const { getPropertyValue } = DataUtils;

export default function reducer(state :Map, action :SequenceAction) {

  return initializeOrganizationDataSet.reducer(state, action, {
    SUCCESS: () => {
      if (action.value[IS_OWNER] === true) {
        const dataSetId :UUID = getPropertyValue(action.value[DATA_SET], [FQNS.OL_ID, 0]);
        const keys :List<List<UUID>> = List().push(List([dataSetId]));
        return state.mergeIn([MY_KEYS], keys);
      }
      return state;
    },
  });
}
