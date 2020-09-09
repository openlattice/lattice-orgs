/*
 * @flow
 */

import React, { useState } from 'react';

import styled from 'styled-components';
import { Button, Checkbox } from 'lattice-ui-kit';
import { ValidationUtils } from 'lattice-utils';
import type { Organization, Role, UUID } from 'lattice';

import { Divider, Header } from '../../../components';
import { AddRoleToOrgModal } from '../components';

const { isValidUUID } = ValidationUtils;

const RolesSectionGrid = styled.div`
  display: grid;
  grid-auto-rows: min-content;
  grid-gap: 16px;
  grid-template-columns: 1fr;
`;

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

  const handleOnChangeRoleCheckBox = (event :SyntheticEvent<HTMLInputElement>) => {
    const roleId :UUID = event.currentTarget.dataset.roleId;
    if (isValidUUID(roleId)) {
      onSelectRole(roleId);
      setSelectedRoleId(roleId);
    }
    else {
      onSelectRole(null);
      setSelectedRoleId(null);
    }
  };

  return (
    <RolesSectionGrid>
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
      <Checkbox
          checked={selectedRoleId === null}
          label="All Members"
          mode="button"
          onChange={handleOnChangeRoleCheckBox} />
      <Divider margin={0} />
      {
        organization.roles.map((role :Role) => (
          <Checkbox
              checked={role.id === selectedRoleId}
              data-role-id={role.id}
              key={role.id}
              label={role.title}
              mode="button"
              onChange={handleOnChangeRoleCheckBox} />
        ))
      }
      {
        isOwner && isVisibleAddRoleToOrgModal && (
          <AddRoleToOrgModal
              onClose={() => setIsVisibleAddRoleToOrgModal(false)}
              organization={organization}
              organizationId={organizationId} />
        )
      }
    </RolesSectionGrid>
  );
};

export default RolesSection;
