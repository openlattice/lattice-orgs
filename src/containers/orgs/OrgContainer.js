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

  const orgMembersPath = Routes.ORG_MEMBERS.replace(Routes.ORG_ID_PARAM, organizationId);
  const renderMembersContainer = () => (
    <OrgMembersContainer isOwner={isOwner} organizationId={organizationId} />
  );

  return (
    <>
      <AppContentWrapper bgColor="white" borderless>
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
          <NavLink exact to={orgMembersPath}>Members</NavLink>
        </AppNavigationWrapper>
      </AppContentWrapper>
      <Switch>
        <Route exact path={Routes.ORG_MEMBERS} render={renderMembersContainer} />
      </Switch>
    </>
  );
};

export default OrgContainer;
