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
  // $FlowFixMe
  Menu,
  // $FlowFixMe
  MenuItem,
  Typography,
} from 'lattice-ui-kit';
import type { Role, UUID } from 'lattice';

import RoleChipsList from './RoleChipsList';

import AssignRolesToMembersModal from '../../components/AssignRolesToMembersModal';
import { getUserProfile } from '../../../../utils';

const { NEUTRAL } = Colors;

const NO_ROLES_APPLIED = 'No Roles Applied';
const Row = styled.tr`
  height: 56px;
`;

const Cell = styled.td`
  border: 1px solid ${NEUTRAL.N100};
  max-width: 0;
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
  onRemoveMember :(member :Map) => void;
  onSelectMember :(member :Map) => void;
  onUnassign :(member :Map, role :Role) => void;
  organizationId :UUID;
  roles :Role[];
  selected :boolean;
};

const TableRow = ({
  isOwner,
  member,
  onRemoveMember,
  onSelectMember,
  onUnassign,
  organizationId,
  roles,
  selected,
} :Props) => {

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const { name, email, id } = getUserProfile(member);
  const memberRoles = get(member, 'roles');
  const memberRolesIds = Set(memberRoles.map((role) => get(role, 'id')));
  const orgRolesIds = Set(roles.map((role) => role.id));

  const identityProvider = member.getIn(['profile', 'identities', 0, 'provider'], '');

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

  const handleSelectMember = () => {
    onSelectMember(member);
  };

  const handleAssignRoles = () => {
    handleMenuOnClose();
    setIsVisible(true);
  };

  return (
    <Row>
      <Cell>
        <Checkbox checked={selected} onChange={handleSelectMember} />
      </Cell>
      <Cell as="th">
        <Typography align="left" noWrap>{name || email}</Typography>
      </Cell>
      <Cell>
        <Typography noWrap>{identityProvider}</Typography>
      </Cell>
      <Cell padding="small">
        <RolesWrapper>
          {
            currentRoles.length
              ? (
                <RoleChipsList
                    deletable={isOwner}
                    member={member}
                    onUnassign={onUnassign}
                    organizationId={organizationId}
                    roles={currentRoles} />
              )
              : <Typography color="textSecondary" noWrap>{NO_ROLES_APPLIED}</Typography>
          }
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
            <MenuItem onClick={handleAssignRoles}>
              Add role
            </MenuItem>
            {/* <MenuItem>
              Remove all roles
            </MenuItem> */}
            <MenuItem onClick={handleRemoveMember}>
              Delete person
            </MenuItem>
          </Menu>
          {
            isOwner && (
              <AssignRolesToMembersModal
                  isVisible={isVisible}
                  members={Map({ [id]: member })}
                  onClose={() => setIsVisible(false)}
                  organizationId={organizationId}
                  roles={roles}
                  shouldCloseOnOutsideClick={false}
                  textTitle="Add Roles"
                  withFooter={false} />
            )
          }
        </RolesWrapper>
      </Cell>
    </Row>
  );
};

export default TableRow;
