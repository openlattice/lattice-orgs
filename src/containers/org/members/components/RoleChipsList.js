// @flow
import React from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { Chip, Typography } from 'lattice-ui-kit';
import type { Role, UUID } from 'lattice';

import { Routes } from '../../../../core/router';
import { getUserProfile } from '../../../../utils/PersonUtils';

const NO_ROLES_APPLIED = 'No Roles Applied';

const ChipsList = styled.div`
  > :not(:first-child) {
    margin-left: 4px;
  }
`;

type Props = {
  deletable :boolean;
  member :Map;
  onDelete :(member :Map, role :Role) => void;
  organizationId :UUID;
  roles :Role[];
};

const RoleChipsList = ({
  deletable,
  member,
  onDelete,
  organizationId,
  roles,
} :Props) => {

  if (!roles.length) return <Typography color="textSecondary">{NO_ROLES_APPLIED}</Typography>;

  const { id } = getUserProfile(member);
  const getHandleDelete = (role :Role) => (e :SyntheticEvent<HTMLElement>) => {
    e.preventDefault();
    onDelete(member, role);
  };

  return (
    <ChipsList>
      {
        roles.map((role, index) => {
          const key = `${id}-${role.id || index}`;
          const roleId :UUID = role.id || '';
          const rolePath = `#${Routes.ORG_ROLE}`
            .replace(Routes.ORG_ID_PARAM, organizationId)
            .replace(Routes.ROLE_ID_PARAM, roleId);

          return (
            <Chip
                clickable
                component="a"
                href={rolePath}
                key={key}
                label={role.title}
                onDelete={deletable && getHandleDelete(role)} />
          );
        })
      }
    </ChipsList>
  );
};

export default RoleChipsList;
