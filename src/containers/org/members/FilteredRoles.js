// @flow
import React from 'react';

import { Checkbox } from 'lattice-ui-kit';
import type { Role, UUID } from 'lattice';

type Props = {
  filterTerm :string;
  onChange :(e :SyntheticEvent<HTMLInputElement>) => void;
  roles :Role[];
  selectedRoleId :UUID | null;
};

const FilteredRoles = ({
  filterTerm,
  onChange,
  roles,
  selectedRoleId,
} :Props) => {

  let filteredRoles = roles;
  if (filterTerm) {
    filteredRoles = filteredRoles.filter((role) => role.title.toLowerCase().includes(filterTerm));
  }

  return (
    <>
      {
        filteredRoles.map((role :Role) => (
          <Checkbox
              checked={role.id === selectedRoleId}
              data-role-id={role.id}
              key={role.id}
              label={role.title}
              mode="button"
              onChange={onChange} />
        ))
      }
    </>
  );
};

export default FilteredRoles;
