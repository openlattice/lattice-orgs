/*
 * @flow
 */

import React, { useEffect } from 'react';

import styled from 'styled-components';
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

// HACK: Very long NestedMenuItem menus will not scroll unless the parent can also scroll.
// force inner wrapper to always be oversized by 1px
const StyledContentWrapper = styled(AppContentWrapper)`
  > div {
    height: calc(100vh - 65px);
  }
`;

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
    const roles = organization.roles.sort((roleA, roleB) => roleA.title.localeCompare(roleB.title));

    return (
      <StyledContentWrapper>
        <Crumbs>
          <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
          <CrumbItem>People</CrumbItem>
        </Crumbs>
        <Typography variant="h1">People</Typography>
        <Divider isVisible={false} margin={8} />
        <Typography component="span" color="textSecondary">{MEMBERS_DESCRIPTION}</Typography>
        <Divider isVisible={false} margin={12} />
        <Typography component="h2" variant="h3">Members</Typography>
        <PeopleTable
            isOwner={isOwner}
            members={orgMembers}
            organizationId={organizationId}
            roles={roles} />
      </StyledContentWrapper>
    );
  }

  return null;
};

export default OrgPeopleContainer;
