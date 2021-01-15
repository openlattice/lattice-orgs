/*
 * @flow
 */

import { Map, fromJS, set } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { DATA_SOURCES, REQUEST_STATE } from '../../../core/redux/constants';

const { GET_ORGANIZATION_DATA_SOURCES, getOrganizationDataSources } = OrganizationsApiActions;

export default function reducer(state :Map, action :SequenceAction) {

  return getOrganizationDataSources.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_ORGANIZATION_DATA_SOURCES, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_ORGANIZATION_DATA_SOURCES, action.id], action),
    SUCCESS: () => {
      const storedAction = state.getIn([GET_ORGANIZATION_DATA_SOURCES, action.id]);
      if (storedAction) {
        const organizationId :UUID = storedAction.value;
        const dataSources = fromJS(action.value).map((dataSource, id) => set(dataSource, 'id', id));
        return state
          .setIn([DATA_SOURCES, organizationId], dataSources)
          .setIn([GET_ORGANIZATION_DATA_SOURCES, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([GET_ORGANIZATION_DATA_SOURCES, action.id])) {
        return state.setIn([GET_ORGANIZATION_DATA_SOURCES, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GET_ORGANIZATION_DATA_SOURCES, action.id]),
  });
}
