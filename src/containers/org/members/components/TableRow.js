// @flow

import React, { useState } from 'react';

import styled from 'styled-components';
import { faEllipsisV } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Map,
  Set,
  get
} from 'immutable';
import {
  Checkbox,
  Colors,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from 'lattice-ui-kit';
import type { Role, UUID } from 'lattice';

import RoleChipsList from './RoleChipsList';

import { getUserProfile } from '../../../../utils/PersonUtils';

const { NEUTRAL } = Colors;

const Row = styled.tr`
  height: 56px;
`;

const Cell = styled.td`
  border: 1px solid ${NEUTRAL.N100};
  max-width: 0px;
  overflow: hidden;
  padding: ${(props) => (props.padding === 'small' ? '0 8px' : '0 16px')};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RolesWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

type Props = {
  isOwner :boolean;
  member :Map;
  onUnassign :(member :Map, role :Role) => void;
  onRemoveMember :(member :Map) => void;
  organizationId :UUID;
  roles :Role[];
};

const TableRow = ({
  isOwner,
  member,
  onRemoveMember,
  onUnassign,
  organizationId,
  roles,
} :Props) => {

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const { name, email } = getUserProfile(member);
  const memberRoles = get(member, 'roles');
  const memberRolesIds = Set(memberRoles.map((role) => get(role, 'id')));
  const orgRolesIds = Set(roles.map((role) => role.id));

  const currentRolesIds = orgRolesIds.intersect(memberRolesIds);
  const currentRoles = roles.filter((role) => currentRolesIds.includes(role.id));

  const handleButtonOnClick = (event :SyntheticEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuOnClose = () => {
    setMenuAnchorEl(null);
  };

  const handleRemoveMember = () => {
    handleMenuOnClose();
    onRemoveMember(member);
  };

  return (
    <Row>
      <Cell>
        <Checkbox />
      </Cell>
      <Cell as="th">
        <Typography align="left" noWrap>{name || email}</Typography>
      </Cell>
      <Cell>
        <Typography noWrap>Auth0</Typography>
      </Cell>
      <Cell padding="small">
        <RolesWrapper>
          <RoleChipsList
              deletable={isOwner}
              member={member}
              onUnassign={onUnassign}
              organizationId={organizationId}
              roles={currentRoles} />
          <IconButton
              aria-controls="member-overflow-menu"
              aria-expanded={menuAnchorEl ? 'true' : false}
              aria-haspopup="menu"
              aria-label="member overflow button"
              onClick={handleButtonOnClick}
              variant="text">
            <FontAwesomeIcon fixedWidth icon={faEllipsisV} />
          </IconButton>
          <Menu
              anchorEl={menuAnchorEl}
              anchorOrigin={{
                horizontal: 'right',
                vertical: 'bottom',
              }}
              elevation={4}
              getContentAnchorEl={null}
              id="member-overflow-menu"
              onClose={handleMenuOnClose}
              open={!!menuAnchorEl}
              transformOrigin={{
                horizontal: 'right',
                vertical: 'top',
              }}>
            <MenuItem>
              Add role
            </MenuItem>
            <MenuItem>
              Remove all roles
            </MenuItem>
            <MenuItem onClick={handleRemoveMember}>
              Delete person
            </MenuItem>
          </Menu>
        </RolesWrapper>
      </Cell>
    </Row>
  );
};

export default TableRow;
