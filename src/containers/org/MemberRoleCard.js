// @flow
import React from 'react';

// $FlowFixMe
import { Chip } from 'lattice-ui-kit';
import { useDispatch } from 'react-redux';
import type { Role, UUID } from 'lattice';

import { ORG_ID_PARAM, ORG_ROLE, ROLE_ID_PARAM } from '../../core/router/Routes';
import { goToRoute } from '../../core/router/actions';

type Props = {
  onClick :(role :Role) => void;
  organizationId :UUID;
  role :Role;
  isUnassignable :boolean;
};

const MemberRoleCard = ({
  onClick,
  organizationId,
  role,
  isUnassignable,
} :Props) => {
  const dispatch = useDispatch();
  const roleId :UUID = role.id || '';
  const rolePath = ORG_ROLE
    .replace(ORG_ID_PARAM, organizationId)
    .replace(ROLE_ID_PARAM, roleId);

  const goToRolePath = () => dispatch(goToRoute(rolePath));

  const handleClick = () => {
    onClick(role);
  };

  return (
    <Chip label={role.title} onClick={goToRolePath} onDelete={isUnassignable ? handleClick : undefined} />
  );
};

export default MemberRoleCard;
