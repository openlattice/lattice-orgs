/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import { List } from 'immutable';
import { AppContentWrapper, Typography } from 'lattice-ui-kit';
import { ReduxUtils } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { Organization, Role, UUID } from 'lattice';

import MembersSection from './MembersSection';
import RolesSection from './RolesSection';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  Divider,
  StackGrid,
} from '../../../components';
import { IS_OWNER, ORGANIZATIONS } from '../../../core/redux/constants';
import { selectOrganizationMembers } from '../../../core/redux/selectors';
import { UsersActions } from '../../../core/users';

const { resetUserSearchResults } = UsersActions;
const { selectOrganization } = ReduxUtils;

const ContainerGrid = styled.div`
  display: grid;
  grid-gap: 48px;
  grid-template-columns: 288px 1fr;
`;

const MEMBERS_DESCRIPTION = 'Members can be granted data permissions on an individual level or by an assigned role.'
  + ' Click on a role to manage its people or datasets.';

const OrgMembersContainer = ({
  organizationId,
  organizationRoute,
} :{|
  organizationId :UUID;
  organizationRoute :string;
|}) => {

  const dispatch = useDispatch();

  const [selectedRole, setSelectedRole] = useState();

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const isOwner :boolean = useSelector((s) => s.getIn([ORGANIZATIONS, IS_OWNER, organizationId]));
  const orgMembers :List = useSelector(selectOrganizationMembers(organizationId));

  useEffect(() => () => {
    dispatch(resetUserSearchResults());
  }, [dispatch]);

  if (organization) {

    const handleOnSelectRole = (roleId :?UUID) => {
      const role :?Role = organization.roles.find((orgRole :Role) => orgRole.id === roleId);
      setSelectedRole(role);
    };

    return (
      <AppContentWrapper>
        <Crumbs>
          <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
          <CrumbItem>Members</CrumbItem>
        </Crumbs>
        <StackGrid>
          <Typography variant="h1">Members</Typography>
          <Typography>{MEMBERS_DESCRIPTION}</Typography>
        </StackGrid>
        <Divider margin={48} />
        <ContainerGrid>
          <RolesSection
              isOwner={isOwner}
              onSelectRole={handleOnSelectRole}
              organization={organization}
              organizationId={organizationId} />
          <MembersSection
              isOwner={isOwner}
              members={orgMembers}
              organization={organization}
              organizationId={organizationId}
              selectedRole={selectedRole} />
        </ContainerGrid>
      </AppContentWrapper>
    );
  }

  return null;
};

export default OrgMembersContainer;
