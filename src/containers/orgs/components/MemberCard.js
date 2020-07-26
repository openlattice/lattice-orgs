/*
 * @flow
 */

import React from 'react';

import { Map } from 'immutable';
import { Card } from 'lattice-ui-kit';
import { Logger, ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import UserActionCardSegment from './UserActionCardSegment';
import type { UserActionObject } from './types';

import { Routes, RoutingActions } from '../../../core/router';
import { PersonUtils } from '../../../utils';

const { goToRoute } = RoutingActions;
const { getPrincipalId } = PersonUtils;
const { isValidUUID } = ValidationUtils;

type Props = {
  actions :Array<UserActionObject>;
  isOwner :boolean;
  member :Map | Object;
  organizationId :UUID;
};

const LOG = new Logger('MemberCard');

const MemberCard = ({
  actions,
  isOwner,
  member,
  organizationId
} :Props) => {

  const securablePrincipalId :?UUID = getPrincipalId(member);

  const handleOnClick = () => {
    if (securablePrincipalId && isValidUUID(securablePrincipalId)) {
      goToRoute(
        Routes.ORG_MEMBER
          .replace(Routes.ORG_ID_PARAM, organizationId)
          .replace(Routes.PRINCIPAL_ID_PARAM, securablePrincipalId),
        { member },
      );
    }
    else {
      LOG.warn('securablePrincipalId is not a valid UUID', securablePrincipalId);
    }
  };

  return (
    <Card onClick={handleOnClick}>
      <UserActionCardSegment
          actions={actions}
          isOwner={isOwner}
          user={member} />
    </Card>
  );
};

export default MemberCard;
