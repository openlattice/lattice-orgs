/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';
import { Map, Set } from 'immutable';
import {
  AppContentWrapper,
  CardSegment,
  Colors,
  PaginationToolbar,
  Spinner,
} from 'lattice-ui-kit';
import { LangUtils, ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type {
  Ace,
  EntitySet,
  Organization,
  Role,
  UUID,
} from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  Divider,
  Header,
  StackGrid,
} from '../../../components';
import { GET_OR_SELECT_ENTITY_SETS, getOrSelectEntitySets } from '../../../core/edm/actions';
import { GET_PERMISSIONS, getPropertyTypePermissions } from '../../../core/permissions/actions';
import { EDM, PERMISSIONS } from '../../../core/redux/constants';
import { selectOrganizationEntitySetIds, selectPermissions } from '../../../core/redux/utils';
import { Routes } from '../../../core/router';

const { NEUTRAL } = Colors;
const { isNonEmptyString } = LangUtils;
const { reduceRequestStates, selectEntitySets, selectOrganization } = ReduxUtils;

const MAX_PER_PAGE = 10;

const DataSetCard = styled.div`
  background-color: ${NEUTRAL.N50};
  border: none;
  border-radius: 5px;
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

type Props = {
  organizationId :UUID;
  roleId :UUID;
};

const OrgRoleContainer = ({ organizationId, roleId } :Props) => {

  const dispatch = useDispatch();
  const [paginationIndex, setPaginationIndex] = useState(0);
  const [paginationPage, setPaginationPage] = useState(0);

  const getPermissionsRS :?RequestState = useRequestState([PERMISSIONS, GET_PERMISSIONS]);
  const getOrSelectEntitySetsRS :?RequestState = useRequestState([EDM, GET_OR_SELECT_ENTITY_SETS]);

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const role :?Role = useMemo(() => (
    organization?.roles.find((orgRole) => orgRole.id === roleId)
  ), [organization, roleId]);

  const entitySetIds :Set<UUID> = useSelector(selectOrganizationEntitySetIds(organizationId));
  const entitySetKeys :Set<Set<UUID>> = useMemo(() => (
    entitySetIds.map((id) => Set([id]))
  ), [entitySetIds]);

  const permissions :Map<Set<UUID>, Ace> = useSelector(selectPermissions(entitySetKeys, role?.principal));
  const permissionsCount :number = permissions.count();
  const pagePermissions :Map<Set<UUID>, Ace> = permissions.slice(paginationIndex, paginationIndex + MAX_PER_PAGE);
  const pageEntitySetIds :Set<UUID> = pagePermissions.keySeq().flatten().toSet();
  const pageEntitySetIdsHash :number = pageEntitySetIds.hashCode();
  const pageEntitySets :Map<UUID, EntitySet> = useSelector(selectEntitySets(pageEntitySetIds));
  const pageEntitySetsHash :number = pageEntitySets.hashCode();

  useEffect(() => {
    if (!pageEntitySetIds.isEmpty()) {
      dispatch(getOrSelectEntitySets(pageEntitySetIds));
    }
  }, [dispatch, pageEntitySetIdsHash]);

  useEffect(() => {
    if (!pageEntitySets.isEmpty()) {
      dispatch(getPropertyTypePermissions(pageEntitySetIds));
    }
  }, [dispatch, pageEntitySetsHash]);

  const orgPath = useMemo(() => (
    Routes.ORG.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  if (organization && role) {

    const reducedRS = reduceRequestStates([getPermissionsRS, getOrSelectEntitySetsRS]);

    const handleOnPageChange = ({ page, start }) => {
      setPaginationIndex(start);
      setPaginationPage(page);
    };

    return (
      <AppContentWrapper>
        <Crumbs>
          <CrumbLink to={orgPath}>{organization.title || 'Organization'}</CrumbLink>
          <CrumbItem>Roles</CrumbItem>
          <CrumbItem>{role.title}</CrumbItem>
        </Crumbs>
        <Header as="h2">{role.title}</Header>
        {
          isNonEmptyString(role.description) && (
            <div>{role.description}</div>
          )
        }
        <Divider margin={48} />
        <Header as="h3">Data Sets</Header>
        <div>Click on a data set to manage permissions.</div>
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
                        page={paginationPage}
                        count={permissionsCount}
                        onPageChange={handleOnPageChange}
                        rowsPerPage={MAX_PER_PAGE} />
                  )
                }
                {
                  pageEntitySets.map((entitySet :EntitySet) => (
                    <DataSetCard key={entitySet.id}>
                      <CardSegment padding="16px">
                        <div>{entitySet.title}</div>
                      </CardSegment>
                    </DataSetCard>
                  )).valueSeq()
                }
              </StackGrid>
            )
          }
        </div>
      </AppContentWrapper>
    );
  }

  // LOG.error()
  return null;
};

export default OrgRoleContainer;
