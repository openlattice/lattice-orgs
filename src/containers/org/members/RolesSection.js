/*
 * @flow
 */

import React, { useState } from 'react';

import styled from 'styled-components';
import { Button, Checkbox } from 'lattice-ui-kit';
import { Logger, ValidationUtils } from 'lattice-utils';
import type { Organization, Role, UUID } from 'lattice';

import { Header } from '../../../components';
import { ERR_INVALID_UUID } from '../../../utils/constants/errors';
import { AddRoleToOrgModal } from '../components';

const { isValidUUID } = ValidationUtils;

const RolesSectionGrid = styled.div`
  display: grid;
  grid-auto-rows: min-content;
  grid-gap: 16px;
  grid-template-columns: 1fr;
  max-width: 288px;
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

const LOG = new Logger('RolesSection');

const RolesSection = ({
  isOwner,
  onSelectRole,
  organization,
  organizationId,
} :Props) => {

  const [isVisibleAddRoleToOrgModal, setIsVisibleAddRoleToOrgModal] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState();

  const handleOnChangeRoleCheckBox = (event :SyntheticEvent<HTMLInputElement>) => {
    const roleId :UUID = event.currentTarget.dataset.roleId;
    if (isValidUUID(roleId)) {
      if (selectedRoleId === roleId) {
        onSelectRole();
        setSelectedRoleId();
      }
      else {
        onSelectRole(roleId);
        setSelectedRoleId(roleId);
      }
    }
    else {
      LOG.error(ERR_INVALID_UUID, roleId);
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
