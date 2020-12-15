// @flow
import React, { useReducer, useRef } from 'react';

import { faEllipsisV } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconButton, Menu, MenuItem } from 'lattice-ui-kit';
import { useSelector } from 'react-redux';
import type { Organization } from 'lattice';

import OrgDescriptionModal from './OrgDescriptionModal';

import { IS_OWNER, ORGANIZATIONS } from '../../../core/redux/constants';

const CLOSE_DESCRIPTION = 'CLOSE_DESCRIPTION';
const CLOSE_MENU = 'CLOSE_MENU';
const OPEN_DESCRIPTION = 'OPEN_DESCRIPTION';
const OPEN_MENU = 'OPEN_MENU';

const INITIAL_STATE = {
  menuOpen: false,
  descriptionOpen: false,
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
        menuOpen: false,
        descriptionOpen: true,
      };
    default:
      return state;
  }
};

type Props = {
  organization :Organization;
};

const OrgActionButton = ({ organization } :Props) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const isOwner :boolean = useSelector((s) => s.getIn([ORGANIZATIONS, IS_OWNER, organization.id]));
  const anchorRef = useRef(null);

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
          Edit Description
        </MenuItem>
      </Menu>
      <OrgDescriptionModal
          isVisible={state.descriptionOpen}
          onClose={handleCloseDescription}
          organization={organization} />
    </>
  );
};

export default OrgActionButton;
