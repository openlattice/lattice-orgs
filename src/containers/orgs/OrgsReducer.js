/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import { matchPath } from 'react-router';
import { RequestStates } from 'redux-reqseq';
import type { Match } from 'react-router';
import type { SequenceAction } from 'redux-reqseq';

import * as Routes from '../../core/router/Routes';
import { getOrganizationId } from './OrgsUtils';

const { GET_ALL_ORGANIZATIONS, getAllOrganizations } = OrganizationsApiActions;

// const ENTITY_SETS_INITIAL_STATE :Map<*, *> = fromJS({
//   appIdToEntitySetIdsMap: Map()
// });

const INITIAL_STATE :Map<*, *> = fromJS({
  [GET_ALL_ORGANIZATIONS]: {
    requestState: RequestStates.STANDBY,
  },
  organizations: List(),
  // relevantEntitySets: ENTITY_SETS_INITIAL_STATE,
  selectedOrganizationId: '',
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

          const organizations :List = fromJS(seqAction.value);

          /*
           * choosing the selected organization requires checking 3 places, in order of priority:
           *   1. URL
           *   2. localStorage
           *   3. organizations data
           */
          let selectedOrganizationId :string = '';
          // by default, choose the first organization from the response data
          if (organizations && !organizations.isEmpty()) {
            selectedOrganizationId = organizations.getIn([0, 'id']);
          }

          // check localStorage for a previously stored organization id
          const storedOrganizationId :?string = getOrganizationId();
          if (storedOrganizationId) {
            selectedOrganizationId = storedOrganizationId;
          }

          // URL trumps everything
          const match :?Match = matchPath(window.location.hash.slice(1), { path: Routes.ORG });
          if (match && match.params.id) {
            const maybeOrgId :UUID = match.params.id;
            const isRealOrganizationId :number = organizations.findIndex((org :Map) => org.get('id') === maybeOrgId);
            if (isRealOrganizationId !== -1) {
              selectedOrganizationId = maybeOrgId;
            }
          }

          return state
            .set('organizations', fromJS(action.value))
            .setIn([GET_ALL_ORGANIZATIONS, 'requestState'], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set('organizations', Map())
          .setIn([GET_ALL_ORGANIZATIONS, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([GET_ALL_ORGANIZATIONS, seqAction.id]),
      });
    }

    // case getRelevantEntitySets.case(action.type): {
    //   return getRelevantEntitySets.reducer(state, action, {
    //     REQUEST: () => state
    //       .set('isFetchingRelevantEntitySets', true)
    //       .set('relevantEntitySets', ENTITY_SETS_INITIAL_STATE),
    //     SUCCESS: () => {
    //       const seqAction :SequenceAction = action;
    //       const relevantEntitySets = {
    //         appIdToEntitySetIdsMap: seqAction.value.appIdToEntitySetIdsMap
    //       };
    //       return state.set('relevantEntitySets', fromJS(relevantEntitySets));
    //     },
    //     FAILURE: () => state.set('relevantEntitySets', ENTITY_SETS_INITIAL_STATE),
    //     FINALLY: () => state.set('isFetchingRelevantEntitySets', false),
    //   });
    // }

    default:
      return state;
  }
}
