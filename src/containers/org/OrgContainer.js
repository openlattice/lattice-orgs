/*
 * @flow
 */

import React, { useEffect, useMemo } from 'react';

import { faFileContract, faUser } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map, fromJS } from 'immutable';
import { CollaborationsApiActions } from 'lattice-sagas';
import {
  AppContentWrapper,
  Colors,
  FolderTab,
  FolderTabs,
  MarkdownPreview,
  Typography,
} from 'lattice-ui-kit';
import {
  LangUtils,
  ReduxUtils,
  useGoToRoute,
  useRequestState,
} from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { Link, Route, Switch } from 'react-router-dom';
import type { Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import CollaborationsParticipationContainer from './CollaborationsParticipationContainer';
import { DELETE_EXISTING_ORGANIZATION } from './actions';
import { DataSetSearchResultCard, OrgActionButton, SearchOrgDataSetsContainer } from './components';

import { BadgeCheckIcon } from '../../assets';
import {
  APPS,
  COLLABORATIONS,
  ORGANIZATIONS,
  PERMISSIONS,
} from '../../common/constants';
import {
  CrumbLink,
  GapGrid,
  SpaceBetweenGrid,
  StackGrid,
} from '../../components';
import { GET_ORG_OBJECT_PERMISSIONS, getOrgObjectPermissions } from '../../core/permissions/actions';
import { resetRequestStates } from '../../core/redux/actions';
import {
  selectCollaborationsByOrgId,
  selectIsAppInstalled,
  selectOrganization,
} from '../../core/redux/selectors';
import { Routes } from '../../core/router';
import { ORG, ORG_COLLABORATIONS, ORG_ID_PARAM } from '../../core/router/Routes';

const { PURPLE } = Colors;
const { isNonEmptyString } = LangUtils;
const { isStandby, isSuccess } = ReduxUtils;
const { GET_COLLABORATIONS_WITH_ORGANIZATION, getCollaborationsWithOrganization } = CollaborationsApiActions;

const OrgContainer = ({
  organizationId,
} :{|
  organizationId :UUID;
|}) => {

  const dispatch = useDispatch();
  const location = useLocation();

  const deleteOrgRS :?RequestState = useRequestState([ORGANIZATIONS, DELETE_EXISTING_ORGANIZATION]);
  const getCollabWithOrgRS :?RequestState = useRequestState([COLLABORATIONS, GET_COLLABORATIONS_WITH_ORGANIZATION]);

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const isInstalled :boolean = useSelector(selectIsAppInstalled(APPS.ACCESS_REQUESTS, organizationId));
  const collaborationsByOrganizationId = useSelector(selectCollaborationsByOrgId(organizationId));

  const collaborationHref = ORG_COLLABORATIONS.replace(ORG_ID_PARAM, organizationId);
  const orgHref = ORG.replace(ORG_ID_PARAM, organizationId);

  const getOrgObjectPermissionsRS :?RequestState = useRequestState([PERMISSIONS, GET_ORG_OBJECT_PERMISSIONS]);

  useEffect(() => {
    if (isStandby(getOrgObjectPermissionsRS)) {
      dispatch(getOrgObjectPermissions(fromJS([[organizationId]])));
    }
  }, [dispatch, getOrgObjectPermissionsRS, organizationId]);

  useEffect(() => () => {
    dispatch(resetRequestStates([GET_ORG_OBJECT_PERMISSIONS]));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getCollaborationsWithOrganization(organizationId));
  }, [dispatch, organizationId]);

  const goToRoot = useGoToRoute(Routes.ROOT);

  useEffect(() => {
    if (isSuccess(deleteOrgRS)) {
      setTimeout(() => {
        dispatch(resetRequestStates([DELETE_EXISTING_ORGANIZATION]));
      }, 1000);
      goToRoot();
    }
  });

  const peoplePath = useMemo(() => (
    Routes.ORG_PEOPLE.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  const rolesPath = useMemo(() => (
    Routes.ORG_ROLES.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  const requestsPath = useMemo(() => (
    Routes.ORG_ACCESS_REQUESTS.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  if (organization) {
    const rolesCount :number = organization.roles.length;
    const peopleCount :number = organization.members.length;

    const collabCount = collaborationsByOrganizationId.size;
    const collabTabText = isSuccess(getCollabWithOrgRS) ? `Collaborations (${collabCount})` : 'Collaborations';

    return (
      <AppContentWrapper>
        <StackGrid>
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
                {
                  isInstalled && (
                    <CrumbLink to={requestsPath}>
                      <GapGrid gap={8}>
                        <FontAwesomeIcon
                            color={PURPLE.P300}
                            fixedWidth
                            icon={faFileContract}
                            style={{ fontSize: '1.6em' }} />
                        <Typography color="primary">Access Requests</Typography>
                      </GapGrid>
                    </CrumbLink>
                  )
                }
              </GapGrid>
              <OrgActionButton organization={organization} />
            </SpaceBetweenGrid>
            {
              isNonEmptyString(organization.description) && (
                <MarkdownPreview>
                  {organization.description}
                </MarkdownPreview>
              )
            }
          </StackGrid>
          <FolderTabs
              aria-label="tabs"
              indicatorColor="primary"
              textColor="primary"
              value={location.pathname}>
            <FolderTab
                component={Link}
                to={orgHref}
                label="Data Sets"
                value={orgHref} />
            <FolderTab
                component={Link}
                to={collaborationHref}
                label={collabTabText}
                value={collaborationHref} />
          </FolderTabs>
          <Switch>
            <Route
                path={ORG}
                exact
                render={() => (
                  <SearchOrgDataSetsContainer organizationId={organizationId}>
                    {(dataSets :List<Map>) => (
                      <StackGrid>
                        {
                          dataSets.map((dataSet :Map) => (
                            <DataSetSearchResultCard
                                dataSet={dataSet}
                                key={dataSet.get('id')}
                                organizationId={organizationId} />
                          ))
                        }
                      </StackGrid>
                    )}
                  </SearchOrgDataSetsContainer>
                )} />
            <Route
                exact
                path={ORG_COLLABORATIONS}
                render={() => (
                  <CollaborationsParticipationContainer
                      collaborations={collaborationsByOrganizationId}
                      type="organization" />
                )} />
          </Switch>
        </StackGrid>
      </AppContentWrapper>
    );
  }

  return null;
};

export default OrgContainer;
