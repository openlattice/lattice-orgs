/*
 * @flow
 */

import React, { useEffect } from 'react';

import { AppContentWrapper, Spinner } from 'lattice-ui-kit';
import {
  Logger,
  RoutingUtils,
  ValidationUtils,
  useRequestState,
} from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { Route, Switch, useRouteMatch } from 'react-router';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import OrgContainer from './OrgContainer';
import OrgDataSetsContainer from './OrgDataSetsContainer';
import { INITIALIZE_ORGANIZATION, initializeOrganization } from './actions';
import { OrgMemberContainer, OrgMembersContainer } from './members';
import { OrgRoleContainer } from './roles';

import { BasicErrorComponent } from '../../components';
import { resetRequestState } from '../../core/redux/actions';
import { ORGANIZATIONS } from '../../core/redux/constants';
import { Routes } from '../../core/router';
import { ERR_INVALID_UUID } from '../../utils/constants/errors';

const { isValidUUID } = ValidationUtils;
const { getParamFromMatch } = RoutingUtils;

const LOG = new Logger('OrgRouter');

const OrgRouter = () => {

  const dispatch = useDispatch();

  let organizationId :?UUID;
  let roleId :?UUID;
  let memberPrincipalId :?UUID;

  const matchOrganization = useRouteMatch(Routes.ORG);
  const matchOrganizationDataSets = useRouteMatch(Routes.ORG_DATA_SETS);
  const matchOrganizationMember = useRouteMatch(Routes.ORG_MEMBER);
  const matchOrganizationRole = useRouteMatch(Routes.ORG_ROLE);

  // NOTE: check matchOrganization last because it's less specific than the others
  if (matchOrganizationDataSets) {
    organizationId = getParamFromMatch(matchOrganizationDataSets, Routes.ORG_ID_PARAM);
  }
  else if (matchOrganizationMember) {
    organizationId = getParamFromMatch(matchOrganizationMember, Routes.ORG_ID_PARAM);
    memberPrincipalId = getParamFromMatch(matchOrganizationMember, Routes.PRINCIPAL_ID_PARAM);
  }
  else if (matchOrganizationRole) {
    organizationId = getParamFromMatch(matchOrganizationRole, Routes.ORG_ID_PARAM);
    roleId = getParamFromMatch(matchOrganizationRole, Routes.ROLE_ID_PARAM);
  }
  else if (matchOrganization) {
    organizationId = getParamFromMatch(matchOrganization, Routes.ORG_ID_PARAM);
  }

  const initializeOrganizationRS :?RequestState = useRequestState([ORGANIZATIONS, INITIALIZE_ORGANIZATION]);

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

  if (initializeOrganizationRS === RequestStates.SUCCESS) {

    const renderOrgContainer = () => (
      (organizationId)
        ? <OrgContainer organizationId={organizationId} />
        : null
    );

    const renderOrgDataSetsContainer = () => (
      (organizationId)
        ? <OrgDataSetsContainer organizationId={organizationId} />
        : null
    );

    const renderOrgMemberContainer = () => (
      (organizationId && memberPrincipalId)
        ? <OrgMemberContainer organizationId={organizationId} memberPrincipalId={memberPrincipalId} />
        : null
    );

    const renderOrgMembersContainer = () => (
      (organizationId)
        ? <OrgMembersContainer organizationId={organizationId} />
        : null
    );

    const renderOrgRoleContainer = () => (
      (organizationId && roleId)
        ? <OrgRoleContainer organizationId={organizationId} roleId={roleId} />
        : null
    );

    return (
      <Switch>
        <Route path={Routes.ORG_DATA_SETS} render={renderOrgDataSetsContainer} />
        <Route path={Routes.ORG_MEMBER} render={renderOrgMemberContainer} />
        <Route path={Routes.ORG_MEMBERS} render={renderOrgMembersContainer} />
        <Route path={Routes.ORG_ROLE} render={renderOrgRoleContainer} />
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
