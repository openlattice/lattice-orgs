// @flow

import React from 'react';
import type { Node } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Types } from 'lattice';
// $FlowFixMe[missing-export]
import { Chip, Popover } from 'lattice-ui-kit';
import type { Role, UUID } from 'lattice';

import { Routes } from '../../../../core/router';

const { PermissionTypes } = Types;

const Wrapper = styled.div`
  padding: 8px;

  ul {
    list-style: none;
    margin-block: 0;
    padding-inline-start: 0;
  }

  li: {
    display: block;
  }

  a {
    margin: 2px 0;
  }
`;

type Props = {
  anchorEl :Node;
  currentRoleAuthorizations :Map;
  handleDelete :(role :Role) => Function;
  onClose :() => void;
  open :boolean;
  organizationId :UUID;
  roles :Role[];
};

const RoleOverflowPopover = ({
  anchorEl,
  currentRoleAuthorizations,
  handleDelete,
  onClose,
  open,
  organizationId,
  roles,
} :Props) => (
  <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      elevation={4}
      onClose={onClose}
      open={open}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}>
    <Wrapper>
      <ul>
        {
          roles.map((role, index) => {
            const authorized = currentRoleAuthorizations.getIn([List(role.aclKey), PermissionTypes.OWNER], false);
            const roleId :UUID = role.id || '';
            const key = `overflow-${roleId || index}`;
            const rolePath = `#${Routes.ORG_ROLE}`
              .replace(Routes.ORG_ID_PARAM, organizationId)
              .replace(Routes.ROLE_ID_PARAM, roleId);

            return (
              <li key={key}>
                <Chip
                    clickable
                    component="a"
                    href={rolePath}
                    label={role.title}
                    onDelete={authorized && handleDelete(role)} />
              </li>
            );
          })
        }
      </ul>
    </Wrapper>
  </Popover>
);

export default RoleOverflowPopover;
