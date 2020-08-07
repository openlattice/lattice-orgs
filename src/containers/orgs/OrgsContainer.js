/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { AppContentWrapper } from 'lattice-ui-kit';
import { useSelector } from 'react-redux';
import type { Organization, UUID } from 'lattice';

import { Header, SimpleOrganizationCard } from '../../components';
import { ORGANIZATIONS, ORGS } from '../../core/redux/constants';

const CardGrid = styled.div`
  display: grid;
  grid-gap: 30px;
  grid-template-columns: 1fr;
  margin-top: 50px;

  @media only screen and (min-width: 500px) {
    grid-template-columns: repeat(auto-fill, minmax(320px, auto));
  }

  > div {
    min-width: 0;
  }
`;

const OrgsContainer = () => {

  const organizations :Map<UUID, Organization> = useSelector((s) => s.getIn([ORGANIZATIONS, ORGS]));

  return (
    <AppContentWrapper>
      <Header as="h2">Organizations</Header>
      {
        !organizations.isEmpty() && (
          <CardGrid>
            {
              organizations.valueSeq().map((org :Organization) => (
                <SimpleOrganizationCard key={org.id} organization={org} />
              ))
            }
          </CardGrid>
        )
      }
    </AppContentWrapper>
  );
};

export default OrgsContainer;
