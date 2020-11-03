/*
 * @flow
 */

import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import styled from 'styled-components';
import { List } from 'immutable';
import { AppContentWrapper } from 'lattice-ui-kit';
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
  Header,
} from '../../../components';
import {
  IS_OWNER,
  ORGANIZATIONS,
} from '../../../core/redux/constants';
import { selectOrganizationMembers } from '../../../core/redux/selectors';
import { Routes } from '../../../core/router';
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

type Props = {
  organizationId :UUID;
};

const OrgMembersContainer = ({ organizationId } :Props) => {

  const dispatch = useDispatch();

  const [selectedRole, setSelectedRole] = useState();

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const isOwner :boolean = useSelector((s) => s.getIn([ORGANIZATIONS, IS_OWNER, organizationId]));
  const orgMembers :List = useSelector(selectOrganizationMembers(organizationId));

  useEffect(() => () => {
    dispatch(resetUserSearchResults());
  }, [dispatch]);

  const orgPath = useMemo(() => (
    Routes.ORG.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  if (organization) {

    const handleOnSelectRole = (roleId :?UUID) => {
      const role :?Role = organization.roles.find((orgRole :Role) => orgRole.id === roleId);
      setSelectedRole(role);
    };

    return (
      <AppContentWrapper>
        <Crumbs>
          <CrumbLink to={orgPath}>{organization.title || 'Organization'}</CrumbLink>
          <CrumbItem>Members</CrumbItem>
        </Crumbs>
        <Header as="h2">Members</Header>
        <span>{MEMBERS_DESCRIPTION}</span>
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
