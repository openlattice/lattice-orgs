/*
 * @flow
 */

import React, { useReducer, useRef } from 'react';

import { faEllipsisV } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// $FlowFixMe
import { IconButton, Menu, MenuItem } from 'lattice-ui-kit';
import { useGoToRoute } from 'lattice-utils';
import { useSelector } from 'react-redux';
import type { Organization, UUID } from 'lattice';

import DeleteOrgModal from './DeleteOrgModal';
import OrgDescriptionModal from './OrgDescriptionModal';

import { selectCurrentUserIsOrgOwner } from '../../../core/redux/selectors';
import { Routes } from '../../../core/router';

const CLOSE_DELETE = 'CLOSE_DELETE';
const CLOSE_DESCRIPTION = 'CLOSE_DESCRIPTION';
const CLOSE_MENU = 'CLOSE_MENU';
const OPEN_DELETE = 'OPEN_DELETE';
const OPEN_DESCRIPTION = 'OPEN_DESCRIPTION';
const OPEN_MENU = 'OPEN_MENU';

const INITIAL_STATE :{|
  deleteOpen :boolean;
  descriptionOpen :boolean;
  menuOpen :boolean;
|} = {
  deleteOpen: false,
  descriptionOpen: false,
  menuOpen: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case CLOSE_MENU:
      return {
        ...state,
        menuOpen: false,
      };
    case OPEN_MENU:
      return {
        ...state,
        menuOpen: true,
      };
    case CLOSE_DESCRIPTION:
      return {
        ...state,
        descriptionOpen: false,
      };
    case OPEN_DESCRIPTION:
      return {
        ...state,
        descriptionOpen: true,
        menuOpen: false,
      };
    case CLOSE_DELETE:
      return {
        ...state,
        deleteOpen: false,
      };
    case OPEN_DELETE:
      return {
        ...state,
        deleteOpen: true,
        menuOpen: false,
      };
    default:
      return state;
  }
};

const OrgActionButton = ({
  organization,
} :{|
  organization :Organization;
|}) => {

  const organizationId :UUID = (organization.id :any);

  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const isOwner :boolean = useSelector(selectCurrentUserIsOrgOwner(organizationId));
  const anchorRef = useRef(null);

  const goToManagePermissions = useGoToRoute(
    Routes.ORG_OBJECT_PERMISSIONS.replace(Routes.ORG_ID_PARAM, organizationId)
  );

  const goToManageDataSources = useGoToRoute(
    Routes.ORG_DATA_SOURCES.replace(Routes.ORG_ID_PARAM, organizationId)
  );

  const goToSettings = useGoToRoute(
    Routes.ORG_SETTINGS.replace(Routes.ORG_ID_PARAM, organizationId)
  );

  const handleOpenMenu = () => {
    dispatch({ type: OPEN_MENU });
  };

  const handleCloseMenu = () => {
    dispatch({ type: CLOSE_MENU });
  };

  const handleOpenDescription = () => {
    dispatch({ type: OPEN_DESCRIPTION });
  };

  const handleCloseDescription = () => {
    dispatch({ type: CLOSE_DESCRIPTION });
  };

  const handleOpenDelete = () => {
    dispatch({ type: OPEN_DELETE });
  };

  const handleCloseDelete = () => {
    dispatch({ type: CLOSE_DELETE });
  };

  return (
    <>
      <IconButton
          aria-controls={state.menuOpen ? 'organization-action-menu' : undefined}
          aria-expanded={state.menuOpen ? 'true' : undefined}
          aria-haspopup="menu"
          aria-label="organization action button"
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
          id="organization-action-menu"
          onClose={handleCloseMenu}
          open={state.menuOpen}
          transformOrigin={{
            horizontal: 'right',
            vertical: 'top',
          }}>
        <MenuItem disabled={!isOwner} onClick={handleOpenDescription}>
          Edit Details
        </MenuItem>
        <MenuItem onClick={goToSettings}>
          Database Details
        </MenuItem>
        <MenuItem disabled={!isOwner} onClick={goToManagePermissions}>
          Manage Permissions
        </MenuItem>
        <MenuItem onClick={goToManageDataSources}>
          Manage Data Sources
        </MenuItem>
        <MenuItem disabled={!isOwner} onClick={handleOpenDelete}>
          Delete Organization
        </MenuItem>
      </Menu>
      <OrgDescriptionModal
          isVisible={state.descriptionOpen}
          onClose={handleCloseDescription}
          organization={organization} />
      <DeleteOrgModal
          isOwner={isOwner}
          isVisible={state.deleteOpen}
          onClose={handleCloseDelete}
          organizationId={organizationId} />
    </>
  );
};

export default OrgActionButton;
