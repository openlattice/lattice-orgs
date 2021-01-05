// @flow
import React from 'react';

import { Checkbox } from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import type { Role, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ORGANIZATIONS } from '../../../core/redux/constants';
import { REMOVE_ROLE_FROM_ORGANIZATION } from '../actions';

const { isPending } = ReduxUtils;

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
  const requestState :?RequestState = useRequestState([ORGANIZATIONS, REMOVE_ROLE_FROM_ORGANIZATION]);
  const isLoading :boolean = isPending(requestState);

  let filteredRoles = roles;
  if (filterTerm) {
    filteredRoles = filteredRoles
      .filter((role) => role.title.toLowerCase().includes(filterTerm.toLowerCase()));
  }

  return (
    <>
      {
        filteredRoles.map((role :Role) => (
          <Checkbox
              checked={role.id === selectedRoleId}
              data-role-id={role.id}
              disabled={isLoading}
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
