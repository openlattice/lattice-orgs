// @flow
import React from 'react';

import styled from 'styled-components';
import { faTimes } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Colors, IconButton } from 'lattice-ui-kit';
import { Link } from 'react-router-dom';
import type { Role, UUID } from 'lattice';

import { RoleIcon } from '../../assets/svg/icons';
import { ORG_ID_PARAM, ORG_ROLE, ROLE_ID_PARAM } from '../../core/router/Routes';

const { NEUTRAL } = Colors;

const RoleCard = styled.div`
  align-items: center;
  background-color: ${NEUTRAL.N50};
  border-radius: 4px;
  border: 1px solid ${NEUTRAL.N50};
  display: grid;
  grid-gap: 16px;
  grid-template-columns: 1fr auto;
  justify-content: space-between;
  padding: 8px 24px;
`;

const StyledLink = styled(Link)`
  color: inherit;
  text-decoration: none;

  :hover {
    text-decoration: underline;
  }
`;

const Flex = styled.div`
  display: flex;
`;

const StyledRoleIcon = styled(RoleIcon)`
  margin-right: 16px;
`;

type Props = {
  onClick :(role :Role) => void;
  organizationId :UUID;
  role :Role;
  unassignable :boolean;
};

const MemberRoleCard = ({
  onClick,
  organizationId,
  role,
  unassignable,
} :Props) => {

  const roleId :UUID = role.id || '';
  const rolePath = ORG_ROLE
    .replace(ORG_ID_PARAM, organizationId)
    .replace(ROLE_ID_PARAM, roleId);

  const handleClick = () => {
    onClick(role);
  };

  return (
    <RoleCard>
      <Flex>
        <StyledRoleIcon />
        <StyledLink to={rolePath}>
          {role.title}
        </StyledLink>
      </Flex>
      {
        unassignable && (
          <IconButton aria-label="unassign-role" onClick={handleClick}>
            <FontAwesomeIcon fixedWidth icon={faTimes} />
          </IconButton>
        )
      }
    </RoleCard>
  );
};

export default MemberRoleCard;
