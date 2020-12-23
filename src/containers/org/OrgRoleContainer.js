/*
 * @flow
 */

import React, { useMemo, useState } from 'react';

import styled from 'styled-components';
import { AppContentWrapper, Modal, Typography } from 'lattice-ui-kit';
import { LangUtils, ReduxUtils } from 'lattice-utils';
import { useSelector } from 'react-redux';
import type { Organization, Role, UUID } from 'lattice';

import { RoleActionButton } from './components';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  SpaceBetweenGrid,
  StackGrid,
  StepsController,
} from '../../components';
import {
  AssignPermissionsToDataSet,
  DataSetPermissionsContainer,
  PermissionsActionsGrid,
  PermissionsPanel,
} from '../permissions';

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
  organizationRoute,
  roleId,
  rolesRoute,
} :{|
  organizationId :UUID;
  organizationRoute :string;
  roleId :UUID;
  rolesRoute :string;
|}) => {

  const [filterByPermissionTypes, setFilterByPermissionTypes] = useState([]);
  const [filterByQuery, setFilterByQuery] = useState('');
  const [isVisibleAddDataSetModal, setIsVisibleAddDataSetModal] = useState(false);
  const [selection, setSelection] = useState();

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const role :?Role = useMemo(() => (
    organization?.roles.find((orgRole) => orgRole.id === roleId)
  ), [organization, roleId]);

  if (organization && role) {

    const handleOnClosePermissionsPanel = () => {
      setSelection();
    };

    return (
      <>
        <AppContentGrid isVisiblePanelColumn={!!selection}>
          <ContentColumn>
            <AppContentWrapper>
              <Crumbs>
                <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
                <CrumbLink to={rolesRoute}>Roles</CrumbLink>
                <CrumbItem>{role.title}</CrumbItem>
              </Crumbs>
              <StackGrid gap={24}>
                <StackGrid>
                  <SpaceBetweenGrid>
                    <Typography variant="h1">{role.title}</Typography>
                    <RoleActionButton organization={organization} role={role} />
                  </SpaceBetweenGrid>
                  {
                    isNonEmptyString(role.description) && (
                      <Typography variant="body1">{role.description}</Typography>
                    )
                  }
                </StackGrid>
                <StackGrid>
                  <Typography variant="h2">Data Sets</Typography>
                  <Typography>Click on a dataset to manage permissions.</Typography>
                </StackGrid>
                <PermissionsActionsGrid
                    assignPermissionsText="Add dataset"
                    onChangeFilterByPermissionTypes={setFilterByPermissionTypes}
                    onChangeFilterByQuery={setFilterByQuery}
                    onClickAssignPermissions={() => setIsVisibleAddDataSetModal(true)} />
                <DataSetPermissionsContainer
                    filterByPermissionTypes={filterByPermissionTypes}
                    filterByQuery={filterByQuery}
                    organizationId={organizationId}
                    onSelect={setSelection}
                    principal={role.principal}
                    selection={selection} />
              </StackGrid>
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
        <Modal
            isVisible={isVisibleAddDataSetModal}
            onClose={() => {}}
            shouldCloseOnOutsideClick={false}
            viewportScrolling
            withFooter={false}
            withHeader={false}>
          <StepsController>
            {
              ({ step, stepBack, stepNext }) => (
                <AssignPermissionsToDataSet
                    onClose={() => setIsVisibleAddDataSetModal(false)}
                    organizationId={organizationId}
                    principal={role.principal}
                    step={step}
                    stepBack={stepBack}
                    stepNext={stepNext} />
              )
            }
          </StepsController>
        </Modal>
      </>
    );
  }

  return null;
};

export default OrgRoleContainer;
