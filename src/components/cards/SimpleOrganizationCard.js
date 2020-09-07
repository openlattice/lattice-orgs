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
  display: grid;
  grid-gap: 8px;
`;

const MembersIcon = styled(FontAwesomeIcon).attrs({ icon: faUserFriends })`
  margin-right: 10px;
`;

const OrgMetaSection = styled.div`
  color: ${NEUTRAL.N500};
  font-weight: normal;
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
      <CardSegment padding="24px">
        <Header align="start" as="h4">{organization.title}</Header>
        <OrgSummarySection>
          <div><span>{organization.description}</span></div>
          <OrgMetaSection>
            <MembersIcon />
            <span>{organization.members.length}</span>
          </OrgMetaSection>
        </OrgSummarySection>
      </CardSegment>
    </Card>
  );
};

export default SimpleOrganizationCard;
