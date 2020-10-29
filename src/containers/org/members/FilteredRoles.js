// @flow
import React from 'react';

import { Checkbox } from 'lattice-ui-kit';
import type { Organization, Role, UUID } from 'lattice';

type Props = {
  onChange :(e :SyntheticEvent<HTMLInputElement>) => void;
  organization :Organization;
  selectedRoleId :UUID | null;
  filterTerm :string;
};

const FilteredRoles = ({
  onChange,
  organization,
  selectedRoleId,
  filterTerm
} :Props) => {

  let filteredRoles = organization.roles;
  if (filterTerm) {
    filteredRoles = organization.roles.filter((role) => role.title.toLowerCase().includes(filterTerm));
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
