/*
 * @flow
 */

import React from 'react';

import { Map } from 'immutable';
import { Card } from 'lattice-ui-kit';
import { Logger, ValidationUtils, useGoToRoute } from 'lattice-utils';
import type { UUID } from 'lattice';

import UserActionCardSegment from './UserActionCardSegment';
import type { UserActionObject } from './types';

import { Routes } from '../../../core/router';
import { PersonUtils } from '../../../utils';

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

  const principalId :?UUID = getPrincipalId(member);

  if (!isValidUUID(principalId)) {
    LOG.warn('principalId is not a valid UUID', principalId);
  }

  const goToMember = useGoToRoute(
    Routes.ORG_MEMBER.replace(Routes.ORG_ID_PARAM, organizationId).replace(Routes.PRINCIPAL_ID_PARAM, principalId),
    { member },
  );

  return (
    <Card onClick={goToMember}>
      <UserActionCardSegment
          actions={actions}
          isOwner={isOwner}
          user={member} />
    </Card>
  );
};

export default MemberCard;
