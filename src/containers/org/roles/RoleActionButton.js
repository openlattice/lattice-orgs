// @flow
import React, { useReducer, useRef } from 'react';

import { faEllipsisH } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconButton, Menu, MenuItem } from 'lattice-ui-kit';
import { useSelector } from 'react-redux';
import type { Organization, Role } from 'lattice';

import RemoveRoleFromOrgModal from './RemoveRoleFromOrgModal';
import RoleDetailsModal from './RoleDetailsModal';

import { IS_OWNER, ORGANIZATIONS } from '../../../core/redux/constants';

const CLOSE_DETAILS = 'CLOSE_DETAILS';
const CLOSE_MENU = 'CLOSE_MENU';
const CLOSE_REMOVE_ROLE = 'CLOSE_REMOVE_ROLE';
const OPEN_DETAILS = 'OPEN_DETAILS';
const OPEN_MENU = 'OPEN_MENU';
const OPEN_REMOVE_ROLE = 'OPEN_REMOVE_ROLE';

const INITIAL_STATE = {
  detailsOpen: false,
  descriptionOpen: false,
  menuOpen: false,
  removeRoleOpen: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case CLOSE_DETAILS:
      return {
        ...state,
        detailsOpen: false,
      };
    case CLOSE_MENU:
      return {
        ...state,
        menuOpen: false,
      };
    case CLOSE_REMOVE_ROLE:
      return {
        ...state,
        removeRoleOpen: false,
      };
    case OPEN_DETAILS:
      return {
        menuOpen: false,
        detailsOpen: true,
      };
    case OPEN_MENU:
      return {
        ...state,
        menuOpen: true,
      };
    case OPEN_REMOVE_ROLE:
      return {
        ...state,
        menuOpen: false,
        removeRoleOpen: true,
      };
    default:
      return state;
  }
};

type Props = {
  organization :Organization;
  role :Role;
};

const RoleActionButton = ({ organization, role } :Props) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const isOwner :boolean = useSelector((s) => s.getIn([ORGANIZATIONS, IS_OWNER, organization.id]));
  const anchorRef = useRef(null);

  const handleOpenMenu = () => {
    dispatch({ type: OPEN_MENU });
  };

  const handleCloseMenu = () => {
    dispatch({ type: CLOSE_MENU });
  };

  const handleOpenDetails = () => {
    dispatch({ type: OPEN_DETAILS });
  };

  const handleCloseDetails = () => {
    dispatch({ type: CLOSE_DETAILS });
  };

  const handleOpenRemoveRole = () => {
    dispatch({ type: OPEN_REMOVE_ROLE });
  };

  const handleCloseRemoveRole = () => {
    dispatch({ type: CLOSE_REMOVE_ROLE });
  };

  return (
    <>
      <IconButton
          aria-controls={state.menuOpen ? 'role-action-menu' : undefined}
          aria-expanded={state.menuOpen ? 'true' : undefined}
          aria-haspopup="menu"
          aria-label="role action button"
          onClick={handleOpenMenu}
          ref={anchorRef}
          variant="text">
        <FontAwesomeIcon icon={faEllipsisH} />
      </IconButton>
      <Menu
          anchorEl={anchorRef.current}
          anchorOrigin={{
            horizontal: 'right',
            vertical: 'bottom',
          }}
          elevation={4}
          getContentAnchorEl={null}
          id="role-action-menu"
          onClose={handleCloseMenu}
          open={state.menuOpen}
          transformOrigin={{
            horizontal: 'right',
            vertical: 'top',
          }}>
        <MenuItem disabled={!isOwner} onClick={handleOpenDetails}>
          Edit Details
        </MenuItem>
        <MenuItem disabled={!isOwner} onClick={handleOpenRemoveRole}>
          Delete Role
        </MenuItem>
      </Menu>
      <RemoveRoleFromOrgModal
          isVisible={state.removeRoleOpen}
          onClose={handleCloseRemoveRole}
          organization={organization}
          role={role} />
      <RoleDetailsModal
          isVisible={state.detailsOpen}
          onClose={handleCloseDetails}
          organization={organization}
          role={role} />
    </>
  );
};

export default RoleActionButton;
