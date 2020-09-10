/*
 * @flow
 */

import React, { useMemo } from 'react';

import { AppContentWrapper } from 'lattice-ui-kit';
import { ReduxUtils } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { Organization, Role, UUID } from 'lattice';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  Header,
} from '../../../components';
import { Routes } from '../../../core/router';

const { selectOrganization } = ReduxUtils;

type Props = {
  organizationId :UUID;
  roleId :UUID;
};

const OrgRoleContainer = ({ organizationId, roleId } :Props) => {

  const dispatch = useDispatch();

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const role :?Role = useMemo(() => (
    organization?.roles.find((r) => r.id === roleId)
  ), [organization, roleId]);

  const orgPath = useMemo(() => (
    Routes.ORG.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  if (organization && role) {
    return (
      <AppContentWrapper>
        <Crumbs>
          <CrumbLink to={orgPath}>{organization.title || 'Organization'}</CrumbLink>
          <CrumbItem>Roles</CrumbItem>
          <CrumbItem>{role.title}</CrumbItem>
        </Crumbs>
        <Header as="h2">{role.title}</Header>
      </AppContentWrapper>
    );
  }

  // LOG.error()
  return null;
};

export default OrgRoleContainer;
