/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

const {
  GET_ALL_ORGANIZATIONS,
  GET_ORGANIZATION,
  getAllOrganizations,
  getOrganization,
} = OrganizationsApiActions;

const INITIAL_STATE :Map<*, *> = fromJS({
  [GET_ALL_ORGANIZATIONS]: {
    requestState: RequestStates.STANDBY,
  },
  [GET_ORGANIZATION]: {
    requestState: RequestStates.STANDBY,
  },
  orgs: Map(),
});

export default function orgsReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case getAllOrganizations.case(action.type): {
      const seqAction :SequenceAction = action;
      return getAllOrganizations.reducer(state, action, {
        REQUEST: () => state
          .setIn([GET_ALL_ORGANIZATIONS, 'requestState'], RequestStates.PENDING)
          .setIn([GET_ALL_ORGANIZATIONS, seqAction.id], seqAction),
        SUCCESS: () => {

          const orgs :List = fromJS(seqAction.value);
          const orgsMap :Map = Map().withMutations((map :Map) => {
            orgs.forEach((org :Map) => map.set(org.get('id'), org));
          });

          // NOTE: this logic will need to be implemented at some point, keeping it around for future reference
          /*
           * choosing the selected organization requires checking 3 places, in order of priority:
           *   1. URL
           *   2. localStorage
           *   3. organizations data
           */
          // let selectedOrganizationId :string = '';
          // // by default, choose the first organization from the response data
          // if (orgs && !orgs.isEmpty()) {
          //   selectedOrganizationId = orgs.getIn([0, 'id']);
          // }
          //
          // // check localStorage for a previously stored organization id
          // const storedOrganizationId :?string = getOrganizationId();
          // if (storedOrganizationId) {
          //   selectedOrganizationId = storedOrganizationId;
          // }
          //
          // // URL trumps everything
          // const match :?Match = matchPath(window.location.hash.slice(1), { path: Routes.ORG });
          // if (match && match.params.id) {
          //   const maybeOrgId :UUID = match.params.id;
          //   const isRealOrganizationId :number = orgs.findIndex((org :Map) => org.get('id') === maybeOrgId);
          //   if (isRealOrganizationId !== -1) {
          //     selectedOrganizationId = maybeOrgId;
          //   }
          // }

          return state
            .set('orgs', orgsMap)
            .setIn([GET_ALL_ORGANIZATIONS, 'requestState'], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set('orgs', Map())
          .setIn([GET_ALL_ORGANIZATIONS, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([GET_ALL_ORGANIZATIONS, seqAction.id]),
      });
    }

    case getOrganization.case(action.type): {
      const seqAction :SequenceAction = action;
      return getOrganization.reducer(state, action, {
        REQUEST: () => state
          .setIn([GET_ORGANIZATION, 'requestState'], RequestStates.PENDING)
          .setIn([GET_ORGANIZATION, seqAction.id], seqAction),
        SUCCESS: () => {
          const org :Map = fromJS(seqAction.value);
          const orgId :UUID = org.get('id');
          return state
            .setIn(['orgs', orgId], org)
            .setIn([GET_ORGANIZATION, 'requestState'], RequestStates.FAILURE);
        },
        FAILURE: () => state.setIn([GET_ORGANIZATION, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([GET_ORGANIZATION, seqAction.id]),
      });
    }

    default:
      return state;
  }
}
