/*
 * @flow
 */

import React, { useEffect } from 'react';

import { AppContentWrapper, Spinner } from 'lattice-ui-kit';
import {
  Logger,
  ReduxUtils,
  RoutingUtils,
  ValidationUtils,
  useRequestState,
} from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch, useRouteMatch } from 'react-router';
import { RequestStates } from 'redux-reqseq';
import type { Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import OrgContainer from './OrgContainer';
import { INITIALIZE_ORGANIZATION, initializeOrganization } from './actions';
import { OrgMembersContainer } from './members';
import { OrgRolesContainer } from './roles';

import { BasicErrorComponent } from '../../components';
import { resetRequestState } from '../../core/redux/actions';
import { ORGANIZATIONS } from '../../core/redux/constants';
import { Routes } from '../../core/router';
import { ERR_INVALID_UUID } from '../../utils/constants/errors';

const { selectOrganization } = ReduxUtils;
const { isValidUUID } = ValidationUtils;
const { getParamFromMatch } = RoutingUtils;

const LOG = new Logger('OrgRouter');

const OrgRouter = () => {

  const dispatch = useDispatch();

  // let memberSPID :?UUID;
  let organizationId :?UUID;

  const matchOrganization = useRouteMatch(Routes.ORG);
  const matchOrganizationMember = useRouteMatch(Routes.ORG_MEMBER);

  // check matchOrganizationMember first because it's more specific than matchOrganization
  if (matchOrganizationMember) {
    // memberSPID = getParamFromMatch(matchOrganizationMember, Routes.PRINCIPAL_ID_PARAM);
    organizationId = getParamFromMatch(matchOrganization, Routes.ORG_ID_PARAM);
  }
  else if (matchOrganization) {
    organizationId = getParamFromMatch(matchOrganization, Routes.ORG_ID_PARAM);
  }

  const initializeOrganizationRS :?RequestState = useRequestState([ORGANIZATIONS, INITIALIZE_ORGANIZATION]);
  const organization :?Organization = useSelector(selectOrganization(organizationId));

  useEffect(() => {
    // reset INITIALIZE_ORGANIZATION RequestState when the org id changes
    dispatch(resetRequestState([INITIALIZE_ORGANIZATION]));
    dispatch(initializeOrganization(organizationId));
    return () => {
      dispatch(resetRequestState([INITIALIZE_ORGANIZATION]));
    };
  }, [dispatch, organizationId]);

  if (initializeOrganizationRS === RequestStates.STANDBY || initializeOrganizationRS === RequestStates.PENDING) {
    return (
      <AppContentWrapper>
        <Spinner size="2x" />
      </AppContentWrapper>
    );
  }

  if (initializeOrganizationRS === RequestStates.FAILURE) {
    return (
      <AppContentWrapper>
        <BasicErrorComponent />
      </AppContentWrapper>
    );
  }

  if (initializeOrganizationRS === RequestStates.SUCCESS && organization && organizationId) {

    const renderOrgContainer = () => (
      <OrgContainer organization={organization} organizationId={organizationId} />
    );

    const renderOrgMembersContainer = () => (
      <OrgMembersContainer organization={organization} organizationId={organizationId} />
    );

    const renderOrgRolesContainer = () => (
      <OrgRolesContainer organization={organization} organizationId={organizationId} />
    );

    return (
      <Switch>
        <Route path={Routes.ORG_MEMBERS} render={renderOrgMembersContainer} />
        <Route path={Routes.ORG_ROLES} render={renderOrgRolesContainer} />
        <Route path={Routes.ORG} render={renderOrgContainer} />
      </Switch>
    );
  }

  if (!isValidUUID(organizationId)) {
    LOG.error(ERR_INVALID_UUID, organizationId);
  }

  return null;
};

export default OrgRouter;
