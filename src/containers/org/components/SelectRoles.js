// @flow
import React, { useState } from 'react';

import debounce from 'lodash/debounce';
import { Map } from 'immutable';
import {
  // $FlowFixMe
  List,
  SearchInput,
  Typography,
} from 'lattice-ui-kit';
import type { Role } from 'lattice';

import RoleListItem from './RoleListItem';

import { getUserProfile } from '../../../utils';

type Props = {
  onClick :(role :Role) => void;
  roles :Role[];
  selectedRoles :Map;
  members :Map;
};

const SelectRoles = ({
  onClick,
  roles,
  selectedRoles,
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

  const { name, email } = getUserProfile(members.first());
  const selectedText = members.size === 1
    ? (name || email)
    : `${members.size} users`;

  return (
    <div>
      <Typography color="textSecondary" gutterBottom>
        {`These are all the roles you can add to ${selectedText}.`}
      </Typography>
      <SearchInput
          onChange={onSearchInputChange}
          placeholder="Search for a role by name" />
      <List>
        {
          filteredRoles.map((role, index) => {
            const id = role.id || '';
            return (
              <RoleListItem
                  checked={selectedRoles.has(id)}
                  disableGutters
                  divider={index !== filteredRoles.length - 1}
                  key={`select-role-${id}`}
                  onSecondaryChange={onClick}
                  role={role} />
            );
          })
        }
      </List>
    </div>
  );
};

SelectRoles.defaultProps = {
  selectedRoles: Map()
};

export default SelectRoles;
