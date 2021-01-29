/*
 * @flow
 */

import React, { useMemo } from 'react';

import { faUser } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AppContentWrapper, Colors, Typography } from 'lattice-ui-kit';
import { LangUtils, ReduxUtils } from 'lattice-utils';
import { useSelector } from 'react-redux';
import type { Organization, UUID } from 'lattice';

import OrgActionButton from './components/OrgActionButton';

import { BadgeCheckIcon } from '../../assets';
import {
  CrumbLink,
  GapGrid,
  SpaceBetweenGrid,
  StackGrid,
} from '../../components';
import { Routes } from '../../core/router';

const { PURPLE } = Colors;
const { isNonEmptyString } = LangUtils;
const { selectOrganization } = ReduxUtils;

type Props = {
  organizationId :UUID;
};

const OrgContainer = ({ organizationId } :Props) => {

  const organization :?Organization = useSelector(selectOrganization(organizationId));

  const peoplePath = useMemo(() => (
    Routes.ORG_PEOPLE.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  const rolesPath = useMemo(() => (
    Routes.ORG_ROLES.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  if (organization) {
    const rolesCount :number = organization.roles.length;
    const peopleCount :number = organization.members.length;
    return (
      <AppContentWrapper>
        <StackGrid>
          <SpaceBetweenGrid>
            <GapGrid gap={32}>
              <Typography variant="h1">{organization.title}</Typography>
              <CrumbLink to={peoplePath}>
                <GapGrid gap={8}>
                  <FontAwesomeIcon color={PURPLE.P300} fixedWidth icon={faUser} size="lg" />
                  <Typography color="primary">{`${peopleCount} People`}</Typography>
                </GapGrid>
              </CrumbLink>
              <CrumbLink to={rolesPath}>
                <GapGrid gap={8}>
                  <BadgeCheckIcon />
                  <Typography color="primary">{`${rolesCount} Roles`}</Typography>
                </GapGrid>
              </CrumbLink>
            </GapGrid>
            <OrgActionButton organization={organization} />
          </SpaceBetweenGrid>
          {
            isNonEmptyString(organization.description) && (
              <div>{organization.description}</div>
            )
          }
        </StackGrid>
      </AppContentWrapper>
    );
  }

  return null;
};

export default OrgContainer;
