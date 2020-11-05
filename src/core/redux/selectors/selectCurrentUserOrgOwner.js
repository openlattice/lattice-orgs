// @flow
import type { Map } from 'immutable';
import type { UUID } from 'lattice';

import { IS_OWNER, ORGANIZATIONS } from '../constants';

export default function selectCurrentUserOrgOwner(organizationId :UUID) {
  return (state :Map) :boolean => state.getIn([ORGANIZATIONS, IS_OWNER, organizationId]);
}
