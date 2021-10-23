/*
 * @flow
 */

import React, { useEffect, useMemo } from 'react';

import { AppContentWrapper } from 'lattice-ui-kit';
import {
  Logger,
  ReduxUtils,
  ValidationUtils,
  useRequestState,
} from 'lattice-utils';
import { useDispatch } from 'react-redux';
import {
  Route,
  Switch,
  useParams,
} from 'react-router';
import type { RequestState } from 'redux-reqseq';

import OrgContainer from './OrgContainer';
import OrgDataSetContainer from './OrgDataSetContainer';
import OrgDataSetObjectPermissionsContainer from './OrgDataSetObjectPermissionsContainer';
import OrgObjectPermissionsContainer from './OrgObjectPermissionsContainer';
import OrgRoleContainer from './OrgRoleContainer';
import OrgRoleObjectPermissionsContainer from './OrgRoleObjectPermissionsContainer';
import OrgRolesContainer from './OrgRolesContainer';
import OrgSettingsContainer from './settings/OrgSettingsContainer';
import { INITIALIZE_ORGANIZATION, initializeOrganization } from './actions';
import { OrgMemberContainer, OrgPeopleContainer } from './people';

import EntityDataContainer from '../explore/EntityDataContainer';
import { EDM, ERR_INVALID_UUID, ORGANIZATIONS } from '../../common/constants';
import { BasicErrorComponent, Spinner } from '../../components';
import { INITIALIZE_ORGANIZATION_DATA_SET } from '../../core/edm/actions';
import { resetRequestStates } from '../../core/redux/actions';
import { Routes } from '../../core/router';
import { SEARCH_DATA, SEARCH_ORGANIZATION_DATA_SETS, clearSearchState } from '../../core/search/actions';
import { OrgAccessRequestsContainer } from '../requests';

const {
  isFailure,
  isPending,
  isStandby,
  isSuccess,
} = ReduxUtils;
const { isValidUUID } = ValidationUtils;

const NO_ROUTE :'#' = '#';

const LOG = new Logger('OrgRouter');

const OrgRouter = () => {

  const dispatch = useDispatch();

  const {
    dataSetId,
    entityKeyId,
    organizationId,
    memberPrincipalId,
    roleId,
  } = useParams();

  const initializeOrganizationRS :?RequestState = useRequestState([ORGANIZATIONS, INITIALIZE_ORGANIZATION]);
  const initializeOrgDataSetRS :?RequestState = useRequestState([EDM, INITIALIZE_ORGANIZATION_DATA_SET]);

  useEffect(() => {
    // reset INITIALIZE_ORGANIZATION RequestState when the org id changes
    dispatch(resetRequestStates([INITIALIZE_ORGANIZATION]));
    dispatch(initializeOrganization(organizationId));
    return () => {
      dispatch(clearSearchState(SEARCH_DATA));
      dispatch(clearSearchState(SEARCH_ORGANIZATION_DATA_SETS));
      dispatch(resetRequestStates([INITIALIZE_ORGANIZATION]));
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

  const dataSetDataRoute = useMemo(() => {
    if (dataSetId && organizationId) {
      return Routes.ORG_DATA_SET_DATA
        .replace(Routes.ORG_ID_PARAM, organizationId)
        .replace(Routes.DATA_SET_ID_PARAM, dataSetId);
    }
    return NO_ROUTE;
  }, [dataSetId, organizationId]);

  const peopleRoute = useMemo(() => {
    if (organizationId) {
      return Routes.ORG_PEOPLE.replace(Routes.ORG_ID_PARAM, organizationId);
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

  const orgSpinner = isStandby(initializeOrganizationRS) || isPending(initializeOrganizationRS);
  const dataSetSpinner = isValidUUID(dataSetId) && isSuccess(initializeOrganizationRS) && (
    isStandby(initializeOrgDataSetRS) || isPending(initializeOrgDataSetRS)
  );
  if (orgSpinner || dataSetSpinner) {
    return (
      <AppContentWrapper>
        <Spinner />
      </AppContentWrapper>
    );
  }

  if (isFailure(initializeOrganizationRS) || isFailure(initializeOrgDataSetRS)) {
    return (
      <AppContentWrapper>
        <BasicErrorComponent />
      </AppContentWrapper>
    );
  }

  if (isSuccess(initializeOrganizationRS)) {

    const renderEntityDataContainer = () => (
      (dataSetId && entityKeyId && organizationId)
        ? (
          <EntityDataContainer
              dataSetDataRoute={dataSetDataRoute}
              dataSetId={dataSetId}
              entityKeyId={entityKeyId}
              organizationId={organizationId}
              organizationRoute={organizationRoute} />
        )
        : null
    );

    const renderOrgDataSetObjectPermissionsContainer = () => (
      (organizationId && dataSetId)
        ? (
          <OrgDataSetObjectPermissionsContainer
              dataSetId={dataSetId}
              dataSetRoute={dataSetRoute}
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
              peopleRoute={peopleRoute}
              organizationId={organizationId}
              organizationRoute={organizationRoute} />
        )
        : null
    );

    const renderOrgObjectPermissionsContainer = () => (
      (organizationId)
        ? <OrgObjectPermissionsContainer organizationId={organizationId} organizationRoute={organizationRoute} />
        : null
    );

    const renderOrgPeopleContainer = () => (
      (organizationId)
        ? <OrgPeopleContainer organizationId={organizationId} organizationRoute={organizationRoute} />
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
        <Route path={Routes.ENTITY} render={renderEntityDataContainer} />
        <Route path={Routes.ORG_ACCESS_REQUESTS} component={OrgAccessRequestsContainer} />
        <Route path={Routes.ORG_DATA_SET_OBJECT_PERMISSIONS} render={renderOrgDataSetObjectPermissionsContainer} />
        <Route path={Routes.ORG_DATA_SET} component={OrgDataSetContainer} />
        <Route path={Routes.ORG_MEMBER} render={renderOrgMemberContainer} />
        <Route path={Routes.ORG_PEOPLE} render={renderOrgPeopleContainer} />
        <Route path={Routes.ORG_ROLE_OBJECT_PERMISSIONS} render={renderOrgRoleObjectPermissionsContainer} />
        <Route path={Routes.ORG_ROLE} render={renderOrgRoleContainer} />
        <Route path={Routes.ORG_ROLES} render={renderOrgRolesContainer} />
        <Route path={Routes.ORG_SETTINGS} render={renderOrgSettingsContainer} />
        <Route path={Routes.ORG_OBJECT_PERMISSIONS} render={renderOrgObjectPermissionsContainer} />
        <Route path={Routes.ORG} component={OrgContainer} />
      </Switch>
    );
  }

  if (!isValidUUID(organizationId)) {
    LOG.error(ERR_INVALID_UUID, organizationId);
  }

  return null;
};

export default OrgRouter;
