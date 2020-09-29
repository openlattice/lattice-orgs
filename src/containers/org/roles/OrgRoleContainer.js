/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';
import { List, Map, Set } from 'immutable';
import {
  AppContentWrapper,
  PaginationToolbar,
  Spinner,
  Typography,
} from 'lattice-ui-kit';
import { LangUtils, ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type {
  Ace,
  EntitySet,
  Organization,
  PermissionType,
  Role,
  UUID,
} from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  Divider,
  StackGrid,
} from '../../../components';
import { GET_OR_SELECT_DATA_SETS, getOrSelectDataSets } from '../../../core/edm/actions';
import { GET_PERMISSIONS, getPropertyTypePermissions } from '../../../core/permissions/actions';
import { EDM, PERMISSIONS } from '../../../core/redux/constants';
import {
  selectOrganizationAtlasDataSetIds,
  selectOrganizationEntitySetIds,
  selectPermissions,
} from '../../../core/redux/utils';
import { Routes } from '../../../core/router';
import { DataSetPermissionsCard, PermissionsPanel } from '../components';

const { isNonEmptyString } = LangUtils;
const { reduceRequestStates, selectEntitySets, selectOrganization } = ReduxUtils;

const MAX_PER_PAGE = 10;

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

const SpinnerOverlay = styled.div`
  background-color: white;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: absolute;
  width: 100%;
  z-index: 1000;
`;

const OrgRoleContainer = ({
  organizationId,
  roleId,
} :{|
  organizationId :UUID;
  roleId :UUID;
|}) => {

  const dispatch = useDispatch();
  const [paginationIndex, setPaginationIndex] = useState(0);
  const [paginationPage, setPaginationPage] = useState(0);
  const [selection, setSelection] = useState();

  const getPermissionsRS :?RequestState = useRequestState([PERMISSIONS, GET_PERMISSIONS]);
  const getOrSelectDataSetsRS :?RequestState = useRequestState([EDM, GET_OR_SELECT_DATA_SETS]);

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const role :?Role = useMemo(() => (
    organization?.roles.find((orgRole) => orgRole.id === roleId)
  ), [organization, roleId]);

  const atlasDataSetIds :Set<UUID> = useSelector(selectOrganizationAtlasDataSetIds(organizationId));
  const entitySetIds :Set<UUID> = useSelector(selectOrganizationEntitySetIds(organizationId));
  const keys :Set<List<UUID>> = useMemo(() => (
    Set().union(atlasDataSetIds).union(entitySetIds).map((id :UUID) => List([id]))
  ), [atlasDataSetIds, entitySetIds]);

  const permissions :Map<List<UUID>, Ace> = useSelector(selectPermissions(keys, role?.principal));
  const permissionsCount :number = permissions.count();
  const pagePermissions :Map<List<UUID>, Ace> = permissions.slice(paginationIndex, paginationIndex + MAX_PER_PAGE);
  const pageDataSetIds :List<UUID> = pagePermissions.keySeq().flatten().toSet();
  const pageDataSetIdsHash :number = pageDataSetIds.hashCode();
  const pageDataSets :Map<UUID, EntitySet> = useSelector(selectEntitySets(pageDataSetIds));
  const pageDataSetsHash :number = pageDataSets.hashCode();

  useEffect(() => {
    if (!pageDataSetIds.isEmpty()) {
      const pageAtlasDataSetIds = pageDataSetIds.filter((id :UUID) => atlasDataSetIds.has(id));
      const pageEntitySetIds = pageDataSetIds.filter((id :UUID) => entitySetIds.has(id));
      dispatch(getOrSelectDataSets({
        organizationId,
        atlasDataSetIds: pageAtlasDataSetIds,
        entitySetIds: pageEntitySetIds,
      }));
    }
  }, [dispatch, pageDataSetIdsHash]);

  useEffect(() => {
    if (!pageDataSets.isEmpty()) {
      dispatch(getPropertyTypePermissions(pageDataSetIds));
    }
  }, [dispatch, pageDataSetsHash]);

  const orgPath = useMemo(() => (
    Routes.ORG.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  if (organization && role) {

    const reducedRS = reduceRequestStates([getPermissionsRS, getOrSelectDataSetsRS]);

    const handleOnPageChange = ({ page, start }) => {
      setPaginationIndex(start);
      setPaginationPage(page);
      setSelection();
    };

    const handleOnSelect = (dataSetId :UUID, permissionType :PermissionType) => {
      setSelection({ dataSetId, permissionType });
    };

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
            <Divider margin={48} />
            <Typography gutterBottom variant="h2">Data Sets</Typography>
            <Typography variant="body1">Click on a data set to manage permissions.</Typography>
            <div>
              {
                reducedRS === RequestStates.PENDING && (
                  <SpinnerOverlay>
                    <Spinner size="2x" />
                  </SpinnerOverlay>
                )
              }
              {
                reducedRS === RequestStates.SUCCESS && (
                  <StackGrid>
                    {
                      permissionsCount > MAX_PER_PAGE && (
                        <PaginationToolbar
                            count={permissionsCount}
                            onPageChange={handleOnPageChange}
                            page={paginationPage}
                            rowsPerPage={MAX_PER_PAGE} />
                      )
                    }
                    {
                      pageDataSets.map((dataSet :EntitySet) => (
                        <DataSetPermissionsCard
                            dataSet={dataSet}
                            key={dataSet.id}
                            onSelect={handleOnSelect}
                            principal={role.principal}
                            selection={selection} />
                      )).valueSeq()
                    }
                  </StackGrid>
                )
              }
            </div>
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

  // LOG.error()
  return null;
};

export default OrgRoleContainer;
