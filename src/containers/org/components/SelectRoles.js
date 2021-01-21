// @flow
import React, { useState } from 'react';

import debounce from 'lodash/debounce';
import { Map } from 'immutable';
import {
  Avatar,
  Checkbox,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  SearchInput,
  Typography,
} from 'lattice-ui-kit';
import type { Role } from 'lattice';

type Props = {
  onClick :() => void;
  roles :Role[];
  selectedRoles :Map;
  onNext :() => void;
  members :Map;
};

const SelectRoles = ({
  onClick,
  roles,
  selectedRoles,
  onNext,
  members,
} :Props) => {
  const [filterQuery, setFilterQuery] = useState('');
  const debounceSetSearchTerm = debounce((value) => {
    setFilterQuery(value);
  }, 250);

  const onSearchInputChange = (event :SyntheticEvent<HTMLInputElement>) => {
    debounceSetSearchTerm(event.currentTarget.value);
  };

  let filteredRoles = roles;
  if (filterQuery) {
    filteredRoles = filteredRoles
      .filter((role) => role.title.toLowerCase().includes(filterQuery.toLowerCase()));
  }

  return (
    <div>
      <Typography color="textSecondary" gutterBottom>
        {`These are all the roles you can add to ${members.size} selected user(s)`}
      </Typography>
      <SearchInput
          onChange={onSearchInputChange}
          placeholder="Filter roles by name" />
      <List>
        {
          filteredRoles.map((role) => (<ListItem key={role.id}>{role.title}</ListItem>))
        }
      </List>
    </div>
  );
};

export default SelectRoles;
