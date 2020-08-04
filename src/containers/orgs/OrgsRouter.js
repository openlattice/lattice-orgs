/*
 * @flow
 */

import React, { useEffect } from 'react';

import { Map } from 'immutable';
import { AppContentWrapper, Spinner } from 'lattice-ui-kit';
import { RoutingUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch, useRouteMatch } from 'react-router';
import { RequestStates } from 'redux-reqseq';
import type { Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import OrgContainer from './OrgContainer';
import OrgMemberContainer from './OrgMemberContainer';
import OrgsContainer from './OrgsContainer';
import { INITIALIZE_ORGANIZATION, initializeOrganization } from './OrgsActions';

import { BasicErrorComponent } from '../../components';
import {
  IS_OWNER,
  MEMBERS,
  ORGANIZATIONS,
  REDUCERS,
} from '../../core/redux/constants';
import { Routes } from '../../core/router';
import { PersonUtils } from '../../utils';

const { getPrincipalId } = PersonUtils;
const { getParamFromMatch } = RoutingUtils;

const OrgsRouter = () => {

  const dispatch = useDispatch();

  let organizationId :?UUID;
  let memberSecurablePrincipalId :?UUID;

  const matchOrganization = useRouteMatch(Routes.ORG);
  const matchOrganizationMember = useRouteMatch(Routes.ORG_MEMBER);

  // check matchOrganizationMember first because it's more specific than matchOrganization
  if (matchOrganizationMember) {
    organizationId = getParamFromMatch(matchOrganization, Routes.ORG_ID_PARAM);
    memberSecurablePrincipalId = getParamFromMatch(matchOrganizationMember, Routes.PRINCIPAL_ID_PARAM);
  }
  else if (matchOrganization) {
    organizationId = getParamFromMatch(matchOrganization, Routes.ORG_ID_PARAM);
  }

  const initializeOrganizationRS :?RequestState = useRequestState([REDUCERS.ORGS, INITIALIZE_ORGANIZATION]);

  const isOwner :boolean = useSelector((s) => s.getIn([REDUCERS.ORGS, IS_OWNER, organizationId]));
  const organization :?Organization = useSelector((s) => s.getIn([REDUCERS.ORGS, ORGANIZATIONS, organizationId]));

  const members :Map = useSelector((s) => s.getIn([REDUCERS.ORGS, MEMBERS, organizationId], Map()));
  const member :?Map = members.find((m :Map) => getPrincipalId(m) === memberSecurablePrincipalId);

  useEffect(() => {
    if (organizationId) {
      dispatch(initializeOrganization(organizationId));
    }
  }, [dispatch, organizationId]);

  if (initializeOrganizationRS === RequestStates.PENDING) {
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

  const renderOrgContainer = () => (
    organization && organizationId
      ? <OrgContainer isOwner={isOwner} organization={organization} organizationId={organizationId} />
      // TODO: better error component
      : <BasicErrorComponent />
  );

  const renderOrgMemberContainer = () => (
    organization && organizationId && member
      ? (
        <OrgMemberContainer
            isOwner={isOwner}
            member={member}
            organization={organization}
            organizationId={organizationId} />
      )
      : <BasicErrorComponent />
  );

  return (
    <Switch>
      <Route exact path={Routes.ORG} render={renderOrgContainer} />
      <Route exact path={Routes.ORG_MEMBER} render={renderOrgMemberContainer} />
      <Route path={Routes.ORGS} component={OrgsContainer} />
    </Switch>
  );
};

export default OrgsRouter;
