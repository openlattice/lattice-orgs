/*
 * @flow
 */

import React, { useEffect, useMemo } from 'react';

import { AppContentWrapper } from 'lattice-ui-kit';
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
import OrgDataSetContainer from './OrgDataSetContainer';
import OrgDataSetObjectPermissionsContainer from './OrgDataSetObjectPermissionsContainer';
import OrgDataSetsContainer from './OrgDataSetsContainer';
import OrgDataSourcesContainer from './OrgDataSourcesContainer';
import OrgObjectPermissionsContainer from './OrgObjectPermissionsContainer';
import OrgRoleContainer from './OrgRoleContainer';
import OrgRoleObjectPermissionsContainer from './OrgRoleObjectPermissionsContainer';
import OrgRolesContainer from './OrgRolesContainer';
import OrgSettingsContainer from './settings/OrgSettingsContainer';
import { INITIALIZE_ORGANIZATION, initializeOrganization } from './actions';
import { OrgMemberContainer, OrgMembersContainer } from './members';

import { BasicErrorComponent, Spinner } from '../../components';
import { resetRequestState } from '../../core/redux/actions';
import { ORGANIZATIONS } from '../../core/redux/constants';
import { Routes } from '../../core/router';
import {
  SEARCH_DATA,
  SEARCH_DATA_SETS,
  SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS,
  SEARCH_DATA_SETS_TO_FILTER,
  SEARCH_ORGANIZATION_DATA_SETS,
  clearSearchState,
} from '../../core/search/actions';
import { ERR_INVALID_UUID } from '../../utils/constants/errors';

const { isValidUUID } = ValidationUtils;
const { getParamFromMatch } = RoutingUtils;

const NO_ROUTE :'#' = '#';

const LOG = new Logger('OrgRouter');

const OrgRouter = () => {

  const dispatch = useDispatch();

  let dataSetId :?UUID;
  let memberPrincipalId :?UUID;
  let organizationId :?UUID;
  let roleId :?UUID;

  const matchOrganization = useRouteMatch(Routes.ORG);
  const matchOrganizationDataSet = useRouteMatch(Routes.ORG_DATA_SET);
  const matchOrganizationDataSets = useRouteMatch(Routes.ORG_DATA_SETS);
  const matchOrganizationDataSources = useRouteMatch(Routes.ORG_DATA_SOURCES);
  const matchOrganizationMember = useRouteMatch(Routes.ORG_MEMBER);
  const matchOrganizationRole = useRouteMatch(Routes.ORG_ROLE);
  const matchOrganizationRoles = useRouteMatch(Routes.ORG_ROLES);
  const matchOrgObjectPermissions = useRouteMatch(Routes.ORG_OBJECT_PERMISSIONS);
  const matchOrgRoleObjectPermissions = useRouteMatch(Routes.ORG_ROLE_OBJECT_PERMISSIONS);
  const matchOrgDataSetObjectPermissions = useRouteMatch(Routes.ORG_DATA_SET_OBJECT_PERMISSIONS);

  if (matchOrgDataSetObjectPermissions) {
    organizationId = getParamFromMatch(matchOrgDataSetObjectPermissions, Routes.ORG_ID_PARAM);
    dataSetId = getParamFromMatch(matchOrgDataSetObjectPermissions, Routes.DATA_SET_ID_PARAM);
  }
  else if (matchOrganizationDataSet) {
    organizationId = getParamFromMatch(matchOrganizationDataSet, Routes.ORG_ID_PARAM);
    dataSetId = getParamFromMatch(matchOrganizationDataSet, Routes.DATA_SET_ID_PARAM);
  }
  else if (matchOrganizationDataSets) {
    organizationId = getParamFromMatch(matchOrganizationDataSets, Routes.ORG_ID_PARAM);
  }
  else if (matchOrganizationDataSources) {
    organizationId = getParamFromMatch(matchOrganizationDataSources, Routes.ORG_ID_PARAM);
  }
  else if (matchOrganizationMember) {
    organizationId = getParamFromMatch(matchOrganizationMember, Routes.ORG_ID_PARAM);
    memberPrincipalId = getParamFromMatch(matchOrganizationMember, Routes.PRINCIPAL_ID_PARAM);
  }
  else if (matchOrgRoleObjectPermissions) {
    organizationId = getParamFromMatch(matchOrgRoleObjectPermissions, Routes.ORG_ID_PARAM);
    roleId = getParamFromMatch(matchOrgRoleObjectPermissions, Routes.ROLE_ID_PARAM);
  }
  else if (matchOrganizationRole) {
    organizationId = getParamFromMatch(matchOrganizationRole, Routes.ORG_ID_PARAM);
    roleId = getParamFromMatch(matchOrganizationRole, Routes.ROLE_ID_PARAM);
  }
  else if (matchOrganizationRoles) {
    organizationId = getParamFromMatch(matchOrganizationRoles, Routes.ORG_ID_PARAM);
  }
  else if (matchOrgObjectPermissions) {
    organizationId = getParamFromMatch(matchOrgObjectPermissions, Routes.ORG_ID_PARAM);
  }
  // NOTE: check matchOrganization last because it's less specific than the others
  else if (matchOrganization) {
    organizationId = getParamFromMatch(matchOrganization, Routes.ORG_ID_PARAM);
  }

  const initializeOrganizationRS :?RequestState = useRequestState([ORGANIZATIONS, INITIALIZE_ORGANIZATION]);

  useEffect(() => {
    // reset INITIALIZE_ORGANIZATION RequestState when the org id changes
    dispatch(resetRequestState([INITIALIZE_ORGANIZATION]));
    dispatch(initializeOrganization(organizationId));
    return () => {
      dispatch(clearSearchState(SEARCH_DATA));
      dispatch(clearSearchState(SEARCH_DATA_SETS));
      dispatch(clearSearchState(SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS));
      dispatch(clearSearchState(SEARCH_DATA_SETS_TO_FILTER));
      dispatch(clearSearchState(SEARCH_ORGANIZATION_DATA_SETS));
      dispatch(resetRequestState([INITIALIZE_ORGANIZATION]));
    };
  }, [dispatch, organizationId]);

  const organizationRoute = useMemo(() => {
    if (organizationId) {
      return Routes.ORG.replace(Routes.ORG_ID_PARAM, organizationId);
    }
    return NO_ROUTE;
  }, [organizationId]);

  const dataSetRoute = useMemo(() => {
    if (dataSetId && organizationId) {
      return Routes.ORG_DATA_SET
        .replace(Routes.ORG_ID_PARAM, organizationId)
        .replace(Routes.DATA_SET_ID_PARAM, dataSetId);
    }
    return NO_ROUTE;
  }, [dataSetId, organizationId]);

  const dataSetsRoute = useMemo(() => {
    if (organizationId) {
      return Routes.ORG_DATA_SETS.replace(Routes.ORG_ID_PARAM, organizationId);
    }
    return NO_ROUTE;
  }, [organizationId]);

  const dataSetDataRoute = useMemo(() => {
    if (dataSetId && organizationId) {
      return Routes.ORG_DATA_SET_DATA
        .replace(Routes.ORG_ID_PARAM, organizationId)
        .replace(Routes.DATA_SET_ID_PARAM, dataSetId);
    }
    return NO_ROUTE;
  }, [dataSetId, organizationId]);

  const membersRoute = useMemo(() => {
    if (organizationId) {
      return Routes.ORG_MEMBERS.replace(Routes.ORG_ID_PARAM, organizationId);
    }
    return NO_ROUTE;
  }, [organizationId]);

  const roleRoute = useMemo(() => {
    if (organizationId && roleId) {
      return Routes.ORG_ROLE.replace(Routes.ORG_ID_PARAM, organizationId).replace(Routes.ROLE_ID_PARAM, roleId);
    }
    return NO_ROUTE;
  }, [organizationId, roleId]);

  const rolesRoute = useMemo(() => {
    if (organizationId) {
      return Routes.ORG_ROLES.replace(Routes.ORG_ID_PARAM, organizationId);
    }
    return NO_ROUTE;
  }, [organizationId]);

  if (initializeOrganizationRS === RequestStates.STANDBY || initializeOrganizationRS === RequestStates.PENDING) {
    return (
      <AppContentWrapper>
        <Spinner />
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

    const renderOrgDataSetContainer = () => (
      (organizationId && dataSetId)
        ? (
          <OrgDataSetContainer
              dataSetDataRoute={dataSetDataRoute}
              dataSetId={dataSetId}
              dataSetRoute={dataSetRoute}
              dataSetsRoute={dataSetsRoute}
              organizationId={organizationId}
              organizationRoute={organizationRoute} />
        )
        : null
    );

    const renderOrgDataSetsContainer = () => (
      (organizationId)
        ? <OrgDataSetsContainer organizationId={organizationId} organizationRoute={organizationRoute} />
        : null
    );

    const renderOrgDataSourcesContainer = () => (
      (organizationId)
        ? <OrgDataSourcesContainer organizationId={organizationId} organizationRoute={organizationRoute} />
        : null
    );

    const renderOrgDataSetObjectPermissionsContainer = () => (
      (organizationId && dataSetId)
        ? (
          <OrgDataSetObjectPermissionsContainer
              dataSetId={dataSetId}
              dataSetRoute={dataSetRoute}
              dataSetsRoute={dataSetsRoute}
              organizationId={organizationId}
              organizationRoute={organizationRoute} />
        )
        : null
    );

    const renderOrgMemberContainer = () => (
      (organizationId && memberPrincipalId)
        ? (
          <OrgMemberContainer
              memberPrincipalId={memberPrincipalId}
              membersRoute={membersRoute}
              organizationId={organizationId}
              organizationRoute={organizationRoute} />
        )
        : null
    );

    const renderOrgMembersContainer = () => (
      (organizationId)
        ? <OrgMembersContainer organizationId={organizationId} organizationRoute={organizationRoute} />
        : null
    );

    const renderOrgObjectPermissionsContainer = () => (
      (organizationId)
        ? <OrgObjectPermissionsContainer organizationId={organizationId} organizationRoute={organizationRoute} />
        : null
    );

    const renderOrgRoleContainer = () => (
      (organizationId && roleId)
        ? (
          <OrgRoleContainer
              organizationId={organizationId}
              organizationRoute={organizationRoute}
              roleId={roleId}
              rolesRoute={rolesRoute} />
        )
        : null
    );

    const renderOrgRolesContainer = () => (
      (organizationId)
        ? <OrgRolesContainer organizationId={organizationId} organizationRoute={organizationRoute} />
        : null
    );

    const renderOrgRoleObjectPermissionsContainer = () => (
      (organizationId && roleId)
        ? (
          <OrgRoleObjectPermissionsContainer
              organizationId={organizationId}
              organizationRoute={organizationRoute}
              roleId={roleId}
              roleRoute={roleRoute}
              rolesRoute={rolesRoute} />
        )
        : null
    );

    const renderOrgSettingsContainer = () => (
      (organizationId)
        ? <OrgSettingsContainer organizationId={organizationId} organizationRoute={organizationRoute} />
        : null
    );

    return (
      <Switch>
        <Route path={Routes.ORG_DATA_SET_OBJECT_PERMISSIONS} render={renderOrgDataSetObjectPermissionsContainer} />
        <Route path={Routes.ORG_DATA_SET} render={renderOrgDataSetContainer} />
        <Route path={Routes.ORG_DATA_SETS} render={renderOrgDataSetsContainer} />
        <Route path={Routes.ORG_DATA_SOURCES} render={renderOrgDataSourcesContainer} />
        <Route path={Routes.ORG_MEMBER} render={renderOrgMemberContainer} />
        <Route path={Routes.ORG_MEMBERS} render={renderOrgMembersContainer} />
        <Route path={Routes.ORG_ROLE_OBJECT_PERMISSIONS} render={renderOrgRoleObjectPermissionsContainer} />
        <Route path={Routes.ORG_ROLE} render={renderOrgRoleContainer} />
        <Route path={Routes.ORG_ROLES} render={renderOrgRolesContainer} />
        <Route path={Routes.ORG_SETTINGS} render={renderOrgSettingsContainer} />
        <Route path={Routes.ORG_OBJECT_PERMISSIONS} render={renderOrgObjectPermissionsContainer} />
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
