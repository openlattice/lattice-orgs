// @flow
import React, { useState } from 'react';

import { faAngleDown } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Menu,
  MenuItem,
} from 'lattice-ui-kit';

const ChevronDown = <FontAwesomeIcon icon={faAngleDown} />;

type Props = {
  onAddRolesClick :() => void;
  onRemoveRolesClick :() => void;
};

const BulkActionButton = ({
  onAddRolesClick,
  onRemoveRolesClick,
} :Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const handleButtonOnClick = (event :SyntheticEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuOnClose = () => {
    setMenuAnchorEl(null);
  };

  const handleAddRolesClick = () => {
    onAddRolesClick();
    handleMenuOnClose();
  };

  const handleRemoveRolesClick = () => {
    onRemoveRolesClick();
    handleMenuOnClose();
  };

  return (
    <>
      <Button
          endIcon={ChevronDown}
          onClick={handleButtonOnClick}
          variant="text">
        Bulk Actions
      </Button>
      <Menu
          anchorEl={menuAnchorEl}
          anchorOrigin={{
            horizontal: 'right',
            vertical: 'bottom',
          }}
          elevation={4}
          getContentAnchorEl={null}
          id="bulk-action-menu"
          onClose={handleMenuOnClose}
          open={!!menuAnchorEl}
          transformOrigin={{
            horizontal: 'right',
            vertical: 'top',
          }}>
        <MenuItem onClick={handleAddRolesClick}>
          Add Roles
        </MenuItem>
        <MenuItem onClick={handleRemoveRolesClick}>
          Remove Roles
        </MenuItem>
      </Menu>
    </>
  );
};

export default BulkActionButton;
