/*
 * @flow
 */

import { Map, fromJS, get } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { DATA_SOURCES, REQUEST_STATE } from '../../../core/redux/constants';

const { UPDATE_ORGANIZATION_DATA_SOURCE, updateOrganizationDataSource } = OrganizationsApiActions;

export default function reducer(state :Map, action :SequenceAction) {

  return updateOrganizationDataSource.reducer(state, action, {
    REQUEST: () => state
      .setIn([UPDATE_ORGANIZATION_DATA_SOURCE, REQUEST_STATE], RequestStates.PENDING)
      .setIn([UPDATE_ORGANIZATION_DATA_SOURCE, action.id], action),
    SUCCESS: () => {
      const storedAction = state.getIn([UPDATE_ORGANIZATION_DATA_SOURCE, action.id]);
      if (storedAction) {
        const { dataSource, organizationId } = storedAction.value;
        return state
          .setIn([DATA_SOURCES, organizationId, get(dataSource, 'id')], fromJS(dataSource))
          .setIn([UPDATE_ORGANIZATION_DATA_SOURCE, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([UPDATE_ORGANIZATION_DATA_SOURCE, action.id])) {
        return state.setIn([UPDATE_ORGANIZATION_DATA_SOURCE, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([UPDATE_ORGANIZATION_DATA_SOURCE, action.id]),
  });
}
