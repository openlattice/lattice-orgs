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
  isOwner :boolean;
  onAddRolesClick :() => void;
  onRemoveMembersClick :() => void;
  onRemoveRolesClick :() => void;
};

const BulkActionButton = ({
  isOwner,
  onAddRolesClick,
  onRemoveMembersClick,
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

  const handleRemoveMembersClick = () => {
    onRemoveMembersClick();
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
        <MenuItem disabled={!isOwner} onClick={handleRemoveMembersClick}>
          Remove Members
        </MenuItem>
      </Menu>
    </>
  );
};

export default BulkActionButton;
