/*
 * @flow
 */

import { Map, fromJS } from 'immutable';

import { RESET_REQUEST_STATE } from '../../../core/redux/actions';
import { resetRequestStateReducer } from '../../../core/redux/reducers';

export { default as addMembersToOrganizationReducer } from './addMembersToOrganizationReducer';
export { default as deleteExistingOrganizationReducer } from './deleteExistingOrganizationReducer';
export { default as editRoleDetailsReducer } from './editRoleDetailsReducer';
export { default as getOrganizationIntegrationDetailsReducer } from './getOrganizationIntegrationDetailsReducer';
export { default as renameOrganizationDatabaseReducer } from './renameOrganizationDatabaseReducer';

const INITIAL_STATE :Map = fromJS({
  // actions
  // data
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATE: {
      return resetRequestStateReducer(state, action);
    }

    default: {
      return state;
    }
  }
}
