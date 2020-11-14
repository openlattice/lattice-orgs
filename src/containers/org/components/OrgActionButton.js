// @flow
import React, { useReducer, useRef } from 'react';

import { faEllipsisH } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconButton, Menu, MenuItem } from 'lattice-ui-kit';
import { useSelector } from 'react-redux';
import type { Organization } from 'lattice';

import OrgDescriptionModal from './OrgDescriptionModal';

import { IS_OWNER, ORGANIZATIONS } from '../../../core/redux/constants';

const INITIAL_STATE = {
  menuOpen: false,
  descriptionOpen: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'closeMenu':
      return {
        ...state,
        menuOpen: false,
      };
    case 'openMenu':
      return {
        ...state,
        menuOpen: true,
      };
    case 'closeDescription':
      return {
        ...state,
        descriptionOpen: false,
      };
    case 'openDescription':
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
    dispatch({ type: 'openMenu' });
  };

  const handleCloseMenu = (event) => {
    dispatch({ type: 'closeMenu' });
  };

  const handleOpenDescription = () => {
    dispatch({ type: 'openDescription' });
  };

  const handleCloseDescription = () => {
    dispatch({ type: 'closeDescription' });
  };

  return (
    <>
      <IconButton
          aria-controls={state.menuOpen ? 'button-action-menu' : undefined}
          aria-expanded={state.menuOpen ? 'true' : undefined}
          aria-haspopup="menu"
          aria-label="select additional action"
          onClick={handleOpenMenu}
          ref={anchorRef}
          variant="text">
        <FontAwesomeIcon icon={faEllipsisH} />
      </IconButton>
      <Menu
          elevation={4}
          open={state.menuOpen}
          onClose={handleCloseMenu}
          anchorEl={anchorRef.current}
          getContentAnchorEl={null}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
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
