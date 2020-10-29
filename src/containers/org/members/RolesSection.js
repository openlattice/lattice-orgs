/*
 * @flow
 */

import React, { useCallback, useState } from 'react';

import styled from 'styled-components';
import { Button, Checkbox, SearchInput } from 'lattice-ui-kit';
import { ValidationUtils } from 'lattice-utils';
import { debounce } from 'lodash';
import type { Organization, UUID } from 'lattice';

import FilteredRoles from './FilteredRoles';

import { Divider, Header, StackGrid } from '../../../components';
import { AddRoleToOrgModal } from '../components';

const { isValidUUID } = ValidationUtils;

const RolesSectionHeader = styled(Header)`
  justify-content: space-between;
  line-height: 48px;
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
      <RolesSectionHeader as="h4">
        <span>Roles</span>
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
