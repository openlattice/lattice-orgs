/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  AppContentWrapper,
  Card,
  CardSegment,
  CardStack,
} from 'lattice-ui-kit';
import type { Organization, UUID } from 'lattice';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  Header,
} from '../../components';
import { Routes } from '../../core/router';
import { PersonUtils } from '../../utils';

const {
  getUserId,
  getUserProfile,
  getUserProfileLabel,
} = PersonUtils;

const Section = styled.section`
  margin-top: 48px;
`;

const RoleTitle = styled.span`
  line-height: 32px;
`;

type Props = {
  member :Map;
  organization :Organization;
  organizationId :UUID;
};

const OrgMemberContainer = ({ member, organization, organizationId } :Props) => {

  const orgPath = Routes.ORG.replace(Routes.ORG_ID_PARAM, organizationId);

  const userProfileLabel = getUserProfileLabel(member);
  const userId = getUserId(member);
  const profile = getUserProfile(member);
  const memberNameTag = profile.name || userProfileLabel || userId;

  const roles = member
    .get('roles', List())
    .filter((role :Map) => role.get('organizationId') === organizationId);

  return (
    <AppContentWrapper>
      <Crumbs>
        <CrumbLink to={orgPath}>{organization.title || 'Organization'}</CrumbLink>
        <CrumbLink to={orgPath}>People</CrumbLink>
        <CrumbItem>{memberNameTag}</CrumbItem>
      </Crumbs>
      <Header as="h2">{memberNameTag}</Header>
      <Section>
        <Header as="h3">Assigned Roles</Header>
        {
          roles.isEmpty() && (
            <i>No assigned roles</i>
          )
        }
        {
          !roles.isEmpty() && (
            <CardStack>
              {
                roles.map((role :Map) => (
                  <Card>
                    <CardSegment padding="8px 16px" vertical={false}>
                      <RoleTitle>{role.get('title')}</RoleTitle>
                    </CardSegment>
                  </Card>
                ))
              }
            </CardStack>
          )
        }
      </Section>
      <Section>
        <Header as="h3">Accessible Data Sets</Header>
      </Section>
    </AppContentWrapper>
  );
};

export default OrgMemberContainer;
