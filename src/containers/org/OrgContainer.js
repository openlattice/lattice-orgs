/*
 * @flow
 */

import React, { useMemo } from 'react';

import styled from 'styled-components';
import { faChevronRight } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Set } from 'immutable';
import { AppContentWrapper, Colors, Typography } from 'lattice-ui-kit';
import { LangUtils, ReduxUtils } from 'lattice-utils';
import { useSelector } from 'react-redux';
import type { Organization, UUID } from 'lattice';

import OrgActionButton from './components/OrgActionButton';

import { ActionWrapper, CrumbLink } from '../../components';
import { selectOrganizationAtlasDataSetIds, selectOrganizationEntitySetIds } from '../../core/redux/selectors';
import { Routes } from '../../core/router';

const { NEUTRAL } = Colors;
const { isNonEmptyString } = LangUtils;
const { selectOrganization } = ReduxUtils;

const Boxes = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 48px;

  > div {
    border: 1px solid ${NEUTRAL.N200};
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 48px;
    margin-right: 48px;
    max-width: 335px;
    padding: 24px 36px;
    width: 100%;

    > span {
      color: ${NEUTRAL.N500};
    }

    > b {
      font-size: 50px;
    }
  }
`;

const ManageLink = styled(CrumbLink)`
  align-items: center;
  font-size: 16px;

  > svg {
    font-size: 12px;
    margin-left: 8px;
    margin-top: 2px;
  }
`;

type Props = {
  organizationId :UUID;
};

const OrgContainer = ({ organizationId } :Props) => {

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const atlasDataSetIds :Set<UUID> = useSelector(selectOrganizationAtlasDataSetIds(organizationId));
  const entitySetIds :Set<UUID> = useSelector(selectOrganizationEntitySetIds(organizationId));

  const dataSetsPath = useMemo(() => (
    Routes.ORG_DATA_SETS.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  const membersPath = useMemo(() => (
    Routes.ORG_MEMBERS.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  const settingsPath = useMemo(() => (
    Routes.ORG_SETTINGS.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  const dataSetCount = entitySetIds.count() + atlasDataSetIds.count();

  if (organization) {
    return (
      <AppContentWrapper>
        <ActionWrapper>
          <Typography gutterBottom variant="h1">{organization.title}</Typography>
          <OrgActionButton organization={organization} />
        </ActionWrapper>
        {
          isNonEmptyString(organization.description) && (
            <div>{organization.description}</div>
          )
        }
        <ManageLink to={settingsPath}>
          <span>Database Details</span>
          <FontAwesomeIcon fixedWidth icon={faChevronRight} size="sm" />
        </ManageLink>
        <Boxes>
          <div>
            <span>Members</span>
            <b>{organization.members.length}</b>
            <ManageLink to={membersPath}>
              <span>Manage Members</span>
              <FontAwesomeIcon fixedWidth icon={faChevronRight} size="sm" />
            </ManageLink>
          </div>
          <div>
            <span>Data Sets</span>
            <b>{dataSetCount}</b>
            <ManageLink to={dataSetsPath}>
              <span>Manage Data Sets</span>
              <FontAwesomeIcon fixedWidth icon={faChevronRight} size="sm" />
            </ManageLink>
          </div>
        </Boxes>
      </AppContentWrapper>
    );
  }

  return null;
};

export default OrgContainer;
