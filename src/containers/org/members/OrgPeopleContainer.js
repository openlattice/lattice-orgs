/*
 * @flow
 */

import React, { useEffect } from 'react';

import { List } from 'immutable';
import { AppContentWrapper, Typography } from 'lattice-ui-kit';
import { ReduxUtils } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { Organization, UUID } from 'lattice';

import PeopleTable from './PeopleTable';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  Divider,
} from '../../../components';
import { IS_OWNER, ORGANIZATIONS } from '../../../core/redux/constants';
import { selectOrganizationMembers } from '../../../core/redux/selectors';
import { UsersActions } from '../../../core/users';

const { resetUserSearchResults } = UsersActions;
const { selectOrganization } = ReduxUtils;

const MEMBERS_DESCRIPTION = 'People can be granted data permissions on an individual level or by an assigned role.'
  + ' Click on a role to manage its people or datasets.';

const OrgPeopleContainer = ({
  organizationId,
  organizationRoute,
} :{|
  organizationId :UUID;
  organizationRoute :string;
|}) => {

  const dispatch = useDispatch();

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const isOwner :boolean = useSelector((s) => s.getIn([ORGANIZATIONS, IS_OWNER, organizationId]));
  const orgMembers :List = useSelector(selectOrganizationMembers(organizationId));

  useEffect(() => () => {
    dispatch(resetUserSearchResults());
  }, [dispatch]);

  if (organization) {

    return (
      <AppContentWrapper>
        <Crumbs>
          <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
          <CrumbItem>People</CrumbItem>
        </Crumbs>
        <Typography variant="h1">People</Typography>
        <Divider isVisible={false} margin={8} />
        <Typography component="span" color="textSecondary">{MEMBERS_DESCRIPTION}</Typography>
        <Divider isVisible={false} margin={12} />
        <PeopleTable />
        {/* <MembersSection
            isOwner={isOwner}
            members={orgMembers}
            organization={organization}
            organizationId={organizationId}
            selectedRole={selectedRole} /> */}
      </AppContentWrapper>
    );
  }

  return null;
};

export default OrgPeopleContainer;
