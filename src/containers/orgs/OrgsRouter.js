/*
 * @flow
 */

import React, { useEffect } from 'react';

import { AppContentWrapper, Spinner } from 'lattice-ui-kit';
import { RoutingUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch, useRouteMatch } from 'react-router';
import { RequestStates } from 'redux-reqseq';
import type { Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import OrgContainer from './OrgContainer';
import OrgsContainer from './OrgsContainer';
import { INITIALIZE_ORGANIZATION, initializeOrganization } from './OrgsActions';

import { BasicErrorComponent } from '../../components';
import { IS_OWNER, ORGANIZATIONS, REDUCERS } from '../../core/redux/constants';
import { Routes } from '../../core/router';

const { getParamFromMatch } = RoutingUtils;

const OrgsRouter = () => {

  const dispatch = useDispatch();

  let organizationId :?UUID;

  const matchOrganization = useRouteMatch(Routes.ORG);
  if (matchOrganization) {
    organizationId = getParamFromMatch(matchOrganization, Routes.ORG_ID_PARAM);
  }

  const getOrganizationRS :?RequestState = useRequestState([REDUCERS.ORGS, INITIALIZE_ORGANIZATION]);
  const organization :?Organization = useSelector((s) => s.getIn([REDUCERS.ORGS, ORGANIZATIONS, organizationId]));
  const isOwner :boolean = useSelector((s) => s.getIn([REDUCERS.ORGS, IS_OWNER, organizationId]));

  useEffect(() => {
    if (organizationId) {
      dispatch(initializeOrganization(organizationId));
    }
  }, [dispatch, organizationId]);

  if (getOrganizationRS === RequestStates.PENDING) {
    return (
      <AppContentWrapper>
        <Spinner size="2x" />
      </AppContentWrapper>
    );
  }

  if (getOrganizationRS === RequestStates.FAILURE) {
    return (
      <AppContentWrapper>
        <BasicErrorComponent />
      </AppContentWrapper>
    );
  }

  const renderOrgContainer = () => (
    organization && organizationId
      ? <OrgContainer isOwner={isOwner} organization={organization} organizationId={organizationId} />
      // TODO: better error component
      : <BasicErrorComponent />
  );

  return (
    <Switch>
      <Route path={Routes.ORG} render={renderOrgContainer} />
      <Route path={Routes.ORGS} component={OrgsContainer} />
    </Switch>
  );
};

export default OrgsRouter;
