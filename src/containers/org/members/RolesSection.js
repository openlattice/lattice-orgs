/*
 * @flow
 */

import React, { useCallback, useState } from 'react';

import debounce from 'lodash/debounce';
import styled from 'styled-components';
import {
  Button,
  Checkbox,
  SearchInput,
  Typography,
} from 'lattice-ui-kit';
import { ValidationUtils } from 'lattice-utils';
import type { Organization, UUID } from 'lattice';

import FilteredRoles from './FilteredRoles';

import { Divider, StackGrid } from '../../../components';
import { AddRoleToOrgModal } from '../components';

const { isValidUUID } = ValidationUtils;

const RolesSectionHeader = styled.div`
  align-items: center;
  display: flex;
  height: 48px;
  justify-content: space-between;
`;

type Props = {
  isOwner :boolean;
  onSelectRole :(roleId :?UUID) => void;
  organization :Organization;
  organizationId :UUID;
};

const RolesSection = ({
  isOwner,
  onSelectRole,
  organization,
  organizationId,
} :Props) => {

  const [isVisibleAddRoleToOrgModal, setIsVisibleAddRoleToOrgModal] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [filterTerm, setFilterTerm] = useState('');

  const debounceSetSearchTerm = debounce((value) => {
    setFilterTerm(value);
  }, 250);

  const handleOnChangeRoleCheckBox = useCallback((event :SyntheticEvent<HTMLInputElement>) => {
    const roleId :UUID = event?.currentTarget?.dataset?.roleId;
    if (isValidUUID(roleId)) {
      onSelectRole(roleId);
      setSelectedRoleId(roleId);
    }
    else {
      onSelectRole(null);
      setSelectedRoleId(null);
    }
  }, [onSelectRole]);

  return (
    <StackGrid>
      <RolesSectionHeader>
        <Typography variant="h4">Roles</Typography>
        {
          isOwner && (
            <Button color="primary" onClick={() => setIsVisibleAddRoleToOrgModal(true)} variant="text">
              + Add Role
            </Button>
          )
        }
      </RolesSectionHeader>
      <SearchInput
          onChange={(event :SyntheticEvent<HTMLInputElement>) => debounceSetSearchTerm(event.currentTarget.value)}
          placeholder="Filter roles" />
      <Checkbox
          checked={selectedRoleId === null}
          label="All Members"
          mode="button"
          onChange={handleOnChangeRoleCheckBox} />
      <Divider margin={0} />
      <FilteredRoles
          filterTerm={filterTerm}
          onChange={handleOnChangeRoleCheckBox}
          roles={organization.roles}
          selectedRoleId={selectedRoleId} />
      {
        isOwner && (
          <AddRoleToOrgModal
              isVisible={isVisibleAddRoleToOrgModal}
              onClose={() => setIsVisibleAddRoleToOrgModal(false)}
              organization={organization}
              organizationId={organizationId} />
        )
      }
    </StackGrid>
  );
};

export default RolesSection;
