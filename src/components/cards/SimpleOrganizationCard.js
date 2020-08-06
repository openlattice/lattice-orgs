/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { faUserFriends } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, CardSegment, Colors } from 'lattice-ui-kit';
import { useGoToRoute } from 'lattice-utils';
import type { Organization, UUID } from 'lattice';

import { Routes } from '../../core/router';
import { Header } from '../headers';

const { NEUTRAL } = Colors;

const OrgSummarySection = styled.div`
  color: ${NEUTRAL.N800};
  display: grid;
  grid-gap: 8px;
`;

const MembersIcon = styled(FontAwesomeIcon).attrs({ icon: faUserFriends })`
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
        <OrgSummarySection>
          <div>
            <MembersIcon />
            <span>{organization.members.length}</span>
          </div>
          <div>{organization.description}</div>
        </OrgSummarySection>
      </CardSegment>
    </Card>
  );
};

export default SimpleOrganizationCard;
