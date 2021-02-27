/*
 * @flow
 */

import React from 'react';

import { AccessRequestContainer } from '@openlattice/access-request';
import { AppContentWrapper } from 'lattice-ui-kit';
import { useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router';
import type { Organization, UUID } from 'lattice';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
} from '../../components';
import { selectOrganization } from '../../core/redux/selectors';
import { Routes } from '../../core/router';

const OrgAccessRequestsContainer = ({
  organizationId,
  organizationRoute,
} :{|
  organizationId :UUID;
  organizationRoute :string;
|}) => {

  const match = useRouteMatch();

  const organization :?Organization = useSelector(selectOrganization(organizationId));

  if (organization) {
    return (
      <AppContentWrapper>
        <Crumbs>
          <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
          <CrumbItem>Access Requests</CrumbItem>
        </Crumbs>
        <AccessRequestContainer match={match} organizationId={organizationId} root={Routes.ORG_ACCESS_REQUESTS} />
      </AppContentWrapper>
    );
  }

  return null;
};

export default OrgAccessRequestsContainer;
