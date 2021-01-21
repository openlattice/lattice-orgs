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
  onSecondaryChange :(role :Role) => void;
};

const RoleListItem = ({
  role,
  checked,
  onSecondaryChange,
  ...rest
} :Props) => {

  const handleCheckboxChange = () => {
    onSecondaryChange(role);
  };

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <ListItem {...rest}>
      <ListItemAvatar>
        <Avatar>{role.title[0].toUpperCase()}</Avatar>
      </ListItemAvatar>
      <Typography variant="body2">{role.title}</Typography>
      <ListItemSecondaryAction>
        <Checkbox checked={checked} onChange={handleCheckboxChange} />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default RoleListItem;
