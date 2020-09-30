/*
 * @flow
 */

import React, { useMemo, useState } from 'react';

import styled from 'styled-components';
import { AppContentWrapper, Typography } from 'lattice-ui-kit';
import { LangUtils, ReduxUtils } from 'lattice-utils';
import { useSelector } from 'react-redux';
import type { Organization, Role, UUID } from 'lattice';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  Divider,
} from '../../../components';
import { Routes } from '../../../core/router';
import { DataSetPermissionsContainer, PermissionsPanel } from '../components';

const { isNonEmptyString } = LangUtils;
const { selectOrganization } = ReduxUtils;

const getPanelColumnSize = ({ isVisiblePanelColumn }) => (
  isVisiblePanelColumn ? 'minmax(auto, 384px)' : 'auto'
);

const AppContentGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr ${getPanelColumnSize};
  height: 100%;
`;

const ContentColumn = styled.div`
  grid-column: 2 / 3;
`;

const PanelColumn = styled.div`
  grid-column-end: 4;
  height: 100%;
`;

const OrgRoleContainer = ({
  organizationId,
  roleId,
} :{|
  organizationId :UUID;
  roleId :UUID;
|}) => {

  const [selection, setSelection] = useState();

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const role :?Role = useMemo(() => (
    organization?.roles.find((orgRole) => orgRole.id === roleId)
  ), [organization, roleId]);

  const orgPath = useMemo(() => (
    Routes.ORG.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  if (organization && role) {

    const handleOnClosePermissionsPanel = () => {
      setSelection();
    };

    return (
      <AppContentGrid isVisiblePanelColumn={!!selection}>
        <ContentColumn>
          <AppContentWrapper>
            <Crumbs>
              <CrumbLink to={orgPath}>{organization.title || 'Organization'}</CrumbLink>
              <CrumbItem>Roles</CrumbItem>
              <CrumbItem>{role.title}</CrumbItem>
            </Crumbs>
            <Typography gutterBottom variant="h1">{role.title}</Typography>
            {
              isNonEmptyString(role.description) && (
                <Typography variant="body1">{role.description}</Typography>
              )
            }
            <Divider isVisible={false} margin={24} />
            <Typography gutterBottom variant="h2">Data Sets</Typography>
            <Typography variant="body1">Click on a data set to manage permissions.</Typography>
            <Divider isVisible={false} margin={8} />
            <DataSetPermissionsContainer
                organizationId={organizationId}
                onSelect={setSelection}
                principal={role.principal}
                selection={selection} />
          </AppContentWrapper>
        </ContentColumn>
        {
          selection && (
            <PanelColumn>
              <PermissionsPanel
                  dataSetId={selection.dataSetId}
                  key={`${selection.dataSetId}-${selection.permissionType}`}
                  onClose={handleOnClosePermissionsPanel}
                  principal={role.principal}
                  permissionType={selection.permissionType} />
            </PanelColumn>
          )
        }
      </AppContentGrid>
    );
  }

  return null;
};

export default OrgRoleContainer;
