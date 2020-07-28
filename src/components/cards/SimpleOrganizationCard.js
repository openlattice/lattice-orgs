/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { faUser } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, CardSegment } from 'lattice-ui-kit';
import { useGoToRoute } from 'lattice-utils';
import type { Organization, UUID } from 'lattice';

import { Routes } from '../../core/router';
import { Header } from '../headers';

const UserIcon = styled(FontAwesomeIcon).attrs({
  icon: faUser
})`
  margin-right: 10px;
`;

type Props = {
  organization :Organization;
};

const SimpleOrganizationCard = ({ organization } :Props) => {

  const organizationId :UUID = (organization.id :any);
  const goToOrganization = useGoToRoute(
    Routes.ORG.replace(Routes.ORG_ID_PARAM, organizationId),
    { organization },
  );

  return (
    <Card id={organizationId} onClick={goToOrganization}>
      <CardSegment>
        <Header align="start" as="h3">{organization.title}</Header>
        <div>
          <UserIcon />
          <span>{organization.members.length}</span>
        </div>
        <div>{organization.description}</div>
      </CardSegment>
    </Card>
  );
};

export default SimpleOrganizationCard;
