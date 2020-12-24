/*
 * @flow
 */

import React, { useReducer, useRef } from 'react';

import { faEllipsisV } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconButton, Menu, MenuItem } from 'lattice-ui-kit';
import { useGoToRoute } from 'lattice-utils';
import { useSelector } from 'react-redux';
import type { Organization, Role, UUID } from 'lattice';

import RoleDetailsModal from './RoleDetailsModal';

import { selectCurrentUserIsOrgOwner } from '../../../core/redux/selectors';
import { Routes } from '../../../core/router';

const CLOSE_DETAILS = 'CLOSE_DETAILS';
const CLOSE_MENU = 'CLOSE_MENU';
const OPEN_DETAILS = 'OPEN_DETAILS';
const OPEN_MENU = 'OPEN_MENU';

const INITIAL_STATE = {
  menuOpen: false,
  detailsOpen: false,
  descriptionOpen: false,
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
    default:
      return state;
  }
};

const RoleActionButton = ({
  organization,
  role,
} :{|
  organization :Organization;
  role :Role;
|}) => {

  const organizationId :UUID = (organization.id :any);
  const roleId :UUID = (role.id :any);

  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const isOwner :boolean = useSelector(selectCurrentUserIsOrgOwner(organizationId));
  const anchorRef = useRef(null);

  const goToOrganization = useGoToRoute(
    Routes.ORG_ROLE_OBJECT_PERMISSIONS
      .replace(Routes.ORG_ID_PARAM, organizationId)
      .replace(Routes.ROLE_ID_PARAM, roleId)
  );

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
        <FontAwesomeIcon fixedWidth icon={faEllipsisV} />
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
          Edit Role Details
        </MenuItem>
        <MenuItem disabled={!isOwner} onClick={goToOrganization}>
          Manage Permissions
        </MenuItem>
      </Menu>
      <RoleDetailsModal
          isVisible={state.detailsOpen}
          onClose={handleCloseDetails}
          organization={organization}
          role={role} />
    </>
  );
};

export default RoleActionButton;
