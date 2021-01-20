/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { DATA_SOURCES, REQUEST_STATE } from '../../../core/redux/constants';

const { REGISTER_ORGANIZATION_DATA_SOURCE, registerOrganizationDataSource } = OrganizationsApiActions;

export default function reducer(state :Map, action :SequenceAction) {

  return registerOrganizationDataSource.reducer(state, action, {
    REQUEST: () => state
      .setIn([REGISTER_ORGANIZATION_DATA_SOURCE, REQUEST_STATE], RequestStates.PENDING)
      .setIn([REGISTER_ORGANIZATION_DATA_SOURCE, action.id], action),
    SUCCESS: () => {
      const storedAction = state.getIn([REGISTER_ORGANIZATION_DATA_SOURCE, action.id]);
      if (storedAction) {
        const { dataSource, organizationId } = storedAction.value;
        const dataSourceId :UUID = action.value;
        return state
          .setIn([DATA_SOURCES, organizationId, dataSourceId], fromJS(dataSource).set('id', dataSourceId))
          .setIn([REGISTER_ORGANIZATION_DATA_SOURCE, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([REGISTER_ORGANIZATION_DATA_SOURCE, action.id])) {
        return state.setIn([REGISTER_ORGANIZATION_DATA_SOURCE, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([REGISTER_ORGANIZATION_DATA_SOURCE, action.id]),
  });
}
