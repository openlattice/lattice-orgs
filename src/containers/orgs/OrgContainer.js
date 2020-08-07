/*
 * @flow
 */

import React from 'react';

import { faLandmark } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Models } from 'lattice';
import { AppContentWrapper, AppNavigationWrapper } from 'lattice-ui-kit';
import { LangUtils } from 'lattice-utils';
import { Route, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';
import type { UUID } from 'lattice';

import OrgMembersContainer from './OrgMembersContainer';
import OrgRolesContainer from './OrgRolesContainer';

import { Header } from '../../components';
import { Routes } from '../../core/router';

const { Organization } = Models;
const { isNonEmptyString } = LangUtils;

type Props = {
  isOwner :boolean;
  organization :Organization;
  organizationId :UUID;
};

const OrgContainer = ({ isOwner, organization, organizationId } :Props) => {

  const orgPath = Routes.ORG.replace(Routes.ORG_ID_PARAM, organizationId);
  const rolesPath = Routes.ORG_ROLES.replace(Routes.ORG_ID_PARAM, organizationId);

  const renderPeopleContainer = () => (
    <OrgMembersContainer isOwner={isOwner} organization={organization} organizationId={organizationId} />
  );

  const renderRolesContainer = () => (
    <OrgRolesContainer isOwner={isOwner} organization={organization} organizationId={organizationId} />
  );

  return (
    <>
      <AppContentWrapper borderless>
        <div>
          <Header as="h2">
            <FontAwesomeIcon fixedWidth icon={faLandmark} size="sm" style={{ marginRight: '20px' }} />
            <span>{organization.title}</span>
          </Header>
        </div>
        {
          isNonEmptyString(organization.description) && (
            <div>{organization.description}</div>
          )
        }
      </AppContentWrapper>
      <AppContentWrapper bgColor="white" padding="0">
        <AppNavigationWrapper borderless>
          <NavLink to={orgPath}>People</NavLink>
          <NavLink to={rolesPath}>Roles</NavLink>
        </AppNavigationWrapper>
      </AppContentWrapper>
      <Switch>
        <Route path={Routes.ORG_MEMBERS} render={renderPeopleContainer} />
        <Route path={Routes.ORG_ROLES} render={renderRolesContainer} />
        <Route path={Routes.ORG} render={renderPeopleContainer} />
      </Switch>
    </>
  );
};

export default OrgContainer;
