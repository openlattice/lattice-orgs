/*
 * @flow
 */

import React, { useMemo } from 'react';

import { AccessRequestContainer } from '@openlattice/access-request';
import { AppContentWrapper } from 'lattice-ui-kit';
import { useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router';
import type { Organization, UUID } from 'lattice';

import { CrumbLink, Crumbs } from '../../components';
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

  const requestsPath = useMemo(() => (
    Routes.ORG_ACCESS_REQUESTS.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  if (organization) {
    return (
      <AppContentWrapper>
        <Crumbs>
          <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
          <CrumbLink to={requestsPath}>Access Requests</CrumbLink>
        </Crumbs>
        <AccessRequestContainer match={match} organizationId={organizationId} root={Routes.ORG_ACCESS_REQUESTS} />
      </AppContentWrapper>
    );
  }

  return null;
};

export default OrgAccessRequestsContainer;
