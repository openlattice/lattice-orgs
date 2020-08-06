/*
 * @flow
 */

import React, { useMemo, useState } from 'react';

import styled from 'styled-components';
import { List, Map, Set } from 'immutable';
import {
  AppContentWrapper,
  Card,
  CardStack,
  PaginationToolbar,
  Spinner,
} from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { EntitySet, Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  Header,
  SpaceBetweenCardSegment,
} from '../../components';
import { PermissionsActions } from '../../core/permissions';
import { REDUCERS } from '../../core/redux/constants';
import { Routes } from '../../core/router';
import { PersonUtils } from '../../utils';

const { GET_ENTITY_SETS_WITH_PERMISSIONS } = PermissionsActions;

const {
  getUserId,
  getUserProfile,
  getUserProfileLabel,
} = PersonUtils;
const { selectEntitySets } = ReduxUtils;

const MAX_ROWS = 20;

const Section = styled.section`
  margin-top: 48px;
`;

const RoleTitle = styled.span`
  line-height: 32px;
`;

type Props = {
  member :Map;
  organization :Organization;
  organizationId :UUID;
};

const OrgMemberContainer = ({ member, organization, organizationId } :Props) => {

  // const dispatch = useDispatch();
  const [paginationIndex, setPaginationIndex] = useState(0);
  const [paginationPage, setPaginationPage] = useState(0);

  const getEntitySetsWithPermissionsRS :?RequestState = useRequestState([
    REDUCERS.PERMISSIONS, GET_ENTITY_SETS_WITH_PERMISSIONS
  ]);

  const orgPath = Routes.ORG.replace(Routes.ORG_ID_PARAM, organizationId);

  const userProfileLabel = getUserProfileLabel(member);
  const userId = getUserId(member);
  const profile = getUserProfile(member);
  const memberNameTag = profile.name || userProfileLabel || userId;

  const roles = member
    .get('roles', List())
    .filter((role :Map) => role.get('organizationId') === organizationId);

  const entitySetIds :Set<UUID> = useSelector((s) => s.getIn(['orgs', 'entitySets', organizationId]), Set());
  const pageEntitySetIds :Set<UUID> = entitySetIds.slice(paginationIndex, paginationIndex + MAX_ROWS);
  const totalEntitySetIds :Set<UUID> = useMemo(() => entitySetIds.count(), [entitySetIds]);
  const entitySets :Map<UUID, EntitySet> = useSelector(selectEntitySets(pageEntitySetIds));

  const handleOnPageChange = ({ page, start }) => {
    setPaginationIndex(start);
    setPaginationPage(page);
  };

  return (
    <AppContentWrapper>
      <Crumbs>
        <CrumbLink to={orgPath}>{organization.title || 'Organization'}</CrumbLink>
        <CrumbLink to={orgPath}>People</CrumbLink>
        <CrumbItem>{memberNameTag}</CrumbItem>
      </Crumbs>
      <Header as="h2">{memberNameTag}</Header>
      <Section>
        <Header as="h3">Assigned Roles</Header>
        {
          roles.isEmpty() && (
            <i>No assigned roles</i>
          )
        }
        {
          !roles.isEmpty() && (
            <CardStack>
              {
                roles.map((role :Map) => (
                  <Card key={role.get('id')}>
                    <SpaceBetweenCardSegment>
                      <RoleTitle>{role.get('title')}</RoleTitle>
                    </SpaceBetweenCardSegment>
                  </Card>
                ))
              }
            </CardStack>
          )
        }
      </Section>
      <Section>
        <Header as="h3">Accessible Data Sets</Header>
        <CardStack>
          {
            getEntitySetsWithPermissionsRS === RequestStates.PENDING && (
              <Spinner size="2x" />
            )
          }
          {
            getEntitySetsWithPermissionsRS === RequestStates.SUCCESS && (
              <>
                <PaginationToolbar
                    page={paginationPage}
                    count={totalEntitySetIds}
                    onPageChange={handleOnPageChange}
                    rowsPerPage={MAX_ROWS} />
                {
                  pageEntitySetIds
                    .filter((entitySetId :UUID) => entitySets.has(entitySetId))
                    .map((entitySetId :UUID) => {
                      const entitySet :EntitySet = entitySets.get(entitySetId);
                      return (
                        <Card key={entitySetId}>
                          <SpaceBetweenCardSegment>
                            <div>{entitySet.title}</div>
                          </SpaceBetweenCardSegment>
                        </Card>
                      );
                    })
                }
                <PaginationToolbar
                    page={paginationPage}
                    count={totalEntitySetIds}
                    onPageChange={handleOnPageChange}
                    rowsPerPage={MAX_ROWS} />
              </>
            )
          }
        </CardStack>
      </Section>
    </AppContentWrapper>
  );
};

export default OrgMemberContainer;
