/*
 * @flow
 */

import { Map } from 'immutable';
import { Models } from 'lattice';
import { RequestStates } from 'redux-reqseq';
import type { OrganizationObject, UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { ERROR, ORGANIZATIONS, REQUEST_STATE } from '../../../core/redux/constants';
import { GET_ORGANIZATIONS_AND_AUTHORIZATIONS, getOrganizationsAndAuthorizations } from '../actions';

const { Organization, OrganizationBuilder } = Models;

export default function reducer(state :Map, action :SequenceAction) {
  return getOrganizationsAndAuthorizations.reducer(state, action, {
    REQUEST: () => state
      .setIn([GET_ORGANIZATIONS_AND_AUTHORIZATIONS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([GET_ORGANIZATIONS_AND_AUTHORIZATIONS, action.id], action),
    SUCCESS: () => {
      if (state.hasIn([GET_ORGANIZATIONS_AND_AUTHORIZATIONS, action.id])) {
        const organizations :Map<UUID, Organization> = Map().asMutable();
        action.value.organizations.forEach((org :OrganizationObject) => {
          organizations.set(org.id, (new OrganizationBuilder(org)).build());
        });
        return state
          .set(ORGANIZATIONS, organizations.asImmutable())
          .setIn([GET_ORGANIZATIONS_AND_AUTHORIZATIONS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => {
      if (state.hasIn([GET_ORGANIZATIONS_AND_AUTHORIZATIONS, action.id])) {
        return state
          .set(ORGANIZATIONS, Map())
          .setIn([GET_ORGANIZATIONS_AND_AUTHORIZATIONS, ERROR], action.value)
          .setIn([GET_ORGANIZATIONS_AND_AUTHORIZATIONS, REQUEST_STATE], RequestStates.FAILURE);
      }
      return state;
    },
    FINALLY: () => state.deleteIn([GET_ORGANIZATIONS_AND_AUTHORIZATIONS, action.id]),
  });
}
