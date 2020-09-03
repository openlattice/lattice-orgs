/*
 * @flow
 */

import React from 'react';

import { faLandmark } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AppContentWrapper, AppNavigationWrapper } from 'lattice-ui-kit';
import { LangUtils } from 'lattice-utils';
import { Route, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';
import type { Organization, UUID } from 'lattice';

import { OrgSettingsContainer } from './settings';

import { Header } from '../../components';
import { Routes } from '../../core/router';

const { isNonEmptyString } = LangUtils;

type Props = {
  organization :Organization;
  organizationId :UUID;
};

const OrgContainer = ({ organization, organizationId } :Props) => {

  const membersPath = Routes.ORG_MEMBERS.replace(Routes.ORG_ID_PARAM, organizationId);
  const settingsPath = Routes.ORG_SETTINGS.replace(Routes.ORG_ID_PARAM, organizationId);

  const renderSettingsContainer = () => (
    <OrgSettingsContainer organization={organization} organizationId={organizationId} />
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
          <NavLink exact to={membersPath}>Members</NavLink>
          <NavLink exact to={settingsPath}>Settings</NavLink>
        </AppNavigationWrapper>
      </AppContentWrapper>
      <Switch>
        <Route path={Routes.ORG_SETTINGS} render={renderSettingsContainer} />
      </Switch>
    </>
  );
};

export default OrgContainer;
