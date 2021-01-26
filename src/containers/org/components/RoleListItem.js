// @flow

import React from 'react';

import {
  Avatar,
  Checkbox,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  Typography,
} from 'lattice-ui-kit';
import type { Role } from 'lattice';

type Props = {
  role :Role;
  checked :boolean;
  disabled :boolean;
  onSecondaryChange :(role :Role) => void;
};

const RoleListItem = ({
  role,
  checked,
  disabled,
  onSecondaryChange,
  ...rest
} :Props) => {

  const handleCheckboxChange = () => {
    onSecondaryChange(role);
  };

  const color = disabled ? 'textSecondary' : 'textPrimary';

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <ListItem {...rest}>
      <ListItemAvatar>
        <Avatar>{role.title[0].toUpperCase()}</Avatar>
      </ListItemAvatar>
      <Typography color={color} variant="body2">{role.title}</Typography>
      <ListItemSecondaryAction>
        <Checkbox checked={checked} disabled={disabled} onChange={handleCheckboxChange} />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default RoleListItem;
