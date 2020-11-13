import React, { useRef, useState } from 'react';

import { faEllipsisH } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconButton, Menu, MenuItem } from 'lattice-ui-kit';
import { Link, useRouteMatch } from 'react-router-dom';

const OrgActionButton = () => {
  const match = useRouteMatch();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleToggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const handleCloseMenu = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setMenuOpen(false);
  };

  return (
    <>
      <IconButton
          aria-controls={isMenuOpen ? 'button-action-menu' : undefined}
          aria-expanded={isMenuOpen ? 'true' : undefined}
          aria-haspopup="menu"
          aria-label="select additional action"
          onClick={handleToggleMenu}
          ref={anchorRef}
          variant="text">
        <FontAwesomeIcon icon={faEllipsisH} />
      </IconButton>
      <Menu
          elevation={4}
          open={isMenuOpen}
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
        <MenuItem>
          Edit Name
        </MenuItem>
        <MenuItem>
          Edit Description
        </MenuItem>
      </Menu>
    </>
  )
};

export default OrgActionButton;
