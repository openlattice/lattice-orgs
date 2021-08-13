/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';
import { AppContentWrapper, Modal, Typography } from 'lattice-ui-kit';
import { LangUtils } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { Organization, Role, UUID } from 'lattice';

import { RoleActionButton } from './components';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  SpaceBetweenGrid,
  StackGrid,
} from '../../components';
import { selectOrganization } from '../../core/redux/selectors';
import { Routes } from '../../core/router';
import { goToRoute } from '../../core/router/actions';
import {
  AssignPermissionsToDataSetModalBody,
  DataSetPermissionsContainer,
  PermissionsActionsGrid,
  PermissionsPanel,
} from '../permissions';

const { isNonEmptyString } = LangUtils;

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

  const dispatch = useDispatch();

  const [filterByFlag, setFilterByFlag] = useState();
  const [filterByPermissionTypes, setFilterByPermissionTypes] = useState([]);
  const [filterByQuery, setFilterByQuery] = useState('');
  const [isVisibleAddDataSetModal, setIsVisibleAddDataSetModal] = useState(false);
  const [selection, setSelection] = useState();

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const role :?Role = useMemo(() => (
    organization?.roles.find((orgRole) => orgRole.id === roleId)
  ), [organization, roleId]);

  useEffect(() => {
    if (organization && !role) {
      const membersPath = Routes.ORG_PEOPLE.replace(Routes.ORG_ID_PARAM, organizationId);
      dispatch(goToRoute(membersPath));
    }
  }, [dispatch, organization, organizationId, role]);

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
                  <Typography>Click on a data set to manage permissions.</Typography>
                  <Typography>
                    An important note - only owners are allowed to manage permissions on a data set. If you expect to
                    see a data set below but it is not there, it is possible that you do not have the OWNER permission
                    on the data set and therefore cannot manage permissions.
                  </Typography>
                </StackGrid>
                <PermissionsActionsGrid
                    assignPermissionsText="Add data set"
                    onChangeFilterByFlag={setFilterByFlag}
                    onChangeFilterByPermissionTypes={setFilterByPermissionTypes}
                    onChangeFilterByQuery={setFilterByQuery}
                    onClickAssignPermissions={() => setIsVisibleAddDataSetModal(true)} />
                <DataSetPermissionsContainer
                    filterByFlag={filterByFlag}
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
                    organizationId={organizationId}
                    principal={role.principal}
                    permissionType={selection.permissionType} />
              </PanelColumn>
            )
          }
        </AppContentGrid>
        <Modal
            isVisible={isVisibleAddDataSetModal}
            onClose={() => setIsVisibleAddDataSetModal(false)}
            shouldCloseOnOutsideClick={false}
            textTitle="Assign Permissions To Data Set"
            viewportScrolling
            withFooter={false}>
          <AssignPermissionsToDataSetModalBody
              onClose={() => setIsVisibleAddDataSetModal(false)}
              organizationId={organizationId}
              principal={role.principal} />
        </Modal>
      </>
    );
  }

  return null;
};

export default OrgRoleContainer;
