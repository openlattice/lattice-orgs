/*
 * @flow
 */

import React from 'react';

import { Map } from 'immutable';
import { AppContentWrapper } from 'lattice-ui-kit';
import type { Organization, UUID } from 'lattice';

import { CrumbItem, CrumbLink, Crumbs } from '../../components';
import { Routes } from '../../core/router';
import { PersonUtils } from '../../utils';

const { getUserProfileLabel } = PersonUtils;

type Props = {
  member :Map;
  organization :Organization;
  organizationId :UUID;
};

const OrgMemberContainer = ({ member, organization, organizationId } :Props) => {

  const orgPath = Routes.ORG.replace(Routes.ORG_ID_PARAM, organizationId);
  const userProfileLabel = getUserProfileLabel(member);

  return (
    <AppContentWrapper>
      <Crumbs>
        <CrumbLink to={orgPath}>{organization.title || 'Organization'}</CrumbLink>
        <CrumbLink to={orgPath}>People</CrumbLink>
        <CrumbItem>{userProfileLabel}</CrumbItem>
      </Crumbs>
    </AppContentWrapper>
  );
};

export default OrgMemberContainer;
