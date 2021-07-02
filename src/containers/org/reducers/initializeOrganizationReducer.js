/*
 * @flow
 */

import { Map } from 'immutable';
import { Models } from 'lattice';
import { RequestStates } from 'redux-reqseq';
import type { Organization } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  ERROR,
  ORGANIZATION,
  ORGANIZATIONS,
  REQUEST_STATE,
} from '../../../core/redux/constants';
import { INITIALIZE_ORGANIZATION, initializeOrganization } from '../actions';

const { OrganizationBuilder } = Models;

export default function reducer(state :Map, action :SequenceAction) {
  return initializeOrganization.reducer(state, action, {
    REQUEST: () => state
      .setIn([INITIALIZE_ORGANIZATION, REQUEST_STATE], RequestStates.PENDING)
      .setIn([INITIALIZE_ORGANIZATION, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([INITIALIZE_ORGANIZATION, action.id])) {
        const organization :Organization = (new OrganizationBuilder(action.value[ORGANIZATION])).build();
        return state
          .setIn([ORGANIZATIONS, organization.id], organization)
          .setIn([INITIALIZE_ORGANIZATION, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([INITIALIZE_ORGANIZATION, action.id])) {
        return state
          .setIn([INITIALIZE_ORGANIZATION, ERROR], action.value)
          .setIn([INITIALIZE_ORGANIZATION, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([INITIALIZE_ORGANIZATION, action.id]),
  });
}
