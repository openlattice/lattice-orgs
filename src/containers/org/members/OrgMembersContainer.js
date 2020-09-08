/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';
import { List } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import { AppContentWrapper, Spinner } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Organization, Role, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { MembersSection, RolesSection } from './components';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  Divider,
  Header,
} from '../../../components';
import {
  IS_OWNER,
  MEMBERS,
  ORGANIZATIONS,
} from '../../../core/redux/constants';
import { Routes } from '../../../core/router';
import { UsersActions } from '../../../core/users';

const { GET_ORGANIZATION_MEMBERS } = OrganizationsApiActions;

const { resetUserSearchResults } = UsersActions;

const ContainerGrid = styled.div`
  display: grid;
  grid-gap: 48px;
  grid-template-columns: 1fr 3fr;
`;

const MEMBERS_DESCRIPTION = 'Members can be granted data permissions on an individual level or by an assigned role.'
  + ' Click on a role to manage its people or datasets.';

type Props = {
  organization :Organization;
  organizationId :UUID;
};

const OrgMembersContainer = ({ organization, organizationId } :Props) => {

  const dispatch = useDispatch();

  const [selectedRole, setSelectedRole] = useState();

  const getOrganizationMembersRS :?RequestState = useRequestState([ORGANIZATIONS, GET_ORGANIZATION_MEMBERS]);

  const isOwner :boolean = useSelector((s) => s.getIn([ORGANIZATIONS, IS_OWNER, organizationId]));
  const orgMembers :List = useSelector((s) => s.getIn([ORGANIZATIONS, MEMBERS, organizationId], List()));

  useEffect(() => () => {
    dispatch(resetUserSearchResults());
  }, []);

  const orgPath = useMemo(() => (
    Routes.ORG.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  if (getOrganizationMembersRS === RequestStates.PENDING) {
    return (
      <AppContentWrapper>
        <Spinner size="2x" />
      </AppContentWrapper>
    );
  }

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
};

export default OrgMembersContainer;
