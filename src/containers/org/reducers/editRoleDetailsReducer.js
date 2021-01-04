/*
 * @flow
 */

import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import { Models } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { ORGS, REQUEST_STATE } from '../../../core/redux/constants';

import { EDIT_ROLE_DETAILS, editRoleDetails } from '../actions';

const {
  Organization,
  OrganizationBuilder,
  RoleBuilder
} = Models;

export default function reducer(state :Map, action :SequenceAction) {
  return editRoleDetails.reducer(state, action, {
    REQUEST: () => state
      .setIn([EDIT_ROLE_DETAILS, REQUEST_STATE], RequestStates.PENDING)
      .setIn([EDIT_ROLE_DETAILS, action.id], action),
    SUCCESS: () => {
      const {
        title,
        description,
        roleId,
        organizationId
      } = action.value;
      if (state.hasIn([EDIT_ROLE_DETAILS, action.id])) {

        const org :Organization = state.getIn([ORGS, organizationId]);
        const updatedRoles = org.roles?.map((role) => {
          if (role.id === roleId) {
            return (new RoleBuilder(role))
              .setDescription(description)
              .setTitle(title)
              .build();
          }
          return role;
        });
        const updatedOrg = (new OrganizationBuilder(org))
          .setRoles(updatedRoles)
          .build();

        return state
          .setIn([ORGS, organizationId], updatedOrg)
          .setIn([EDIT_ROLE_DETAILS, REQUEST_STATE], RequestStates.SUCCESS);
      }
      return state;
    },
    FAILURE: () => state.setIn([EDIT_ROLE_DETAILS, REQUEST_STATE], RequestStates.FAILURE),
    FINALLY: () => state.deleteIn([EDIT_ROLE_DETAILS, action.id]),
  });
}
