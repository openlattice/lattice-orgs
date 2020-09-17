/*
 * @flow
 */

import React, { useMemo, useState } from 'react';

import styled from 'styled-components';
import { Map, Set } from 'immutable';
import { AppContentWrapper, PaginationToolbar } from 'lattice-ui-kit';
import { ReduxUtils } from 'lattice-utils';
import { useSelector } from 'react-redux';
import type {
  Ace,
  Organization,
  Role,
  UUID,
} from 'lattice';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  Header,
} from '../../../components';
import { selectOrganizationEntitySetIds, selectPermissions } from '../../../core/redux/utils';
import { Routes } from '../../../core/router';

const { selectOrganization } = ReduxUtils;

const MAX_PER_PAGE = 10;

const DataSetsGrid = styled.div`
  display: grid;
  grid-auto-rows: min-content;
  grid-gap: 16px;
  grid-template-columns: 1fr;
`;

type Props = {
  organizationId :UUID;
  roleId :UUID;
};

const OrgRoleContainer = ({ organizationId, roleId } :Props) => {

  const [paginationIndex, setPaginationIndex] = useState(0);
  const [paginationPage, setPaginationPage] = useState(0);

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const entitySetIds :Set<UUID> = useSelector(selectOrganizationEntitySetIds(organizationId));

  const entitySetKeys :Set<Set<UUID>> = useMemo(() => (
    entitySetIds.map((id) => Set([id]))
  ), [entitySetIds]);

  const role :?Role = useMemo(() => (
    organization?.roles.find((orgRole) => orgRole.id === roleId)
  ), [organization, roleId]);

  const roleEntitySetPermissions :Map<Set<UUID>, Ace> = useSelector(selectPermissions(entitySetKeys, role?.principal));

  const roleEntitySetPermissionsCount :number = roleEntitySetPermissions.count();
  const pagePermissions :Map = roleEntitySetPermissions.slice(
    paginationIndex,
    paginationIndex + MAX_PER_PAGE,
  );

  const orgPath = useMemo(() => (
    Routes.ORG.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  const handleOnPageChange = ({ page, start }) => {
    setPaginationIndex(start);
    setPaginationPage(page);
  };

  if (organization && role) {
    return (
      <AppContentWrapper>
        <Crumbs>
          <CrumbLink to={orgPath}>{organization.title || 'Organization'}</CrumbLink>
          <CrumbItem>Roles</CrumbItem>
          <CrumbItem>{role.title}</CrumbItem>
        </Crumbs>
        <Header as="h2">{role.title}</Header>
        <Header as="h3">Data Sets</Header>
        <DataSetsGrid>
          {
            roleEntitySetPermissionsCount > MAX_PER_PAGE && (
              <PaginationToolbar
                  page={paginationPage}
                  count={roleEntitySetPermissionsCount}
                  onPageChange={handleOnPageChange}
                  rowsPerPage={MAX_PER_PAGE} />
            )
          }
          {
            pagePermissions.map((ace :Ace, key :Set<UUID>) => {
              const permissionsLabel = ace.permissions.length === 0 ? ace.permissions[0] : 'Mixed permissions';
              return (
                <div key={key.toString()}>
                  <div>{key.toString()}</div>
                  <div>{permissionsLabel}</div>
                </div>
              );
            }).valueSeq()
          }
        </DataSetsGrid>
      </AppContentWrapper>
    );
  }

  // LOG.error()
  return null;
};

export default OrgRoleContainer;
