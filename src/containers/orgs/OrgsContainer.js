/*
 * @flow
 */

import React, { useState } from 'react';

import { Map } from 'immutable';
import {
  AppContentWrapper,
  Button,
  CardStack,
  Input,
} from 'lattice-ui-kit';
import { useSelector } from 'react-redux';
import type { Organization, UUID } from 'lattice';

import { ElementWithButtonGrid, Header, SimpleOrganizationCard } from '../../components';
import { ORGANIZATIONS, ORGS } from '../../core/redux/constants';
import { CreateOrgModal } from '../org/components';

const OrgsContainer = () => {

  const [isVisibleAddOrgModal, setIsVisibleCreateOrgModal] = useState(false);
  const [orgFilterQuery, setOrgFilterQuery] = useState('');

  const organizations :Map<UUID, Organization> = useSelector((s) => s.getIn([ORGANIZATIONS, ORGS]));
  const filteredOrganizations = organizations.filter((org :Organization, orgId :UUID) => (
    org && (orgFilterQuery === orgId || org.title.toLowerCase().includes(orgFilterQuery))
  ));

  const handleOnChangeOrgFilter = (event :SyntheticInputEvent<HTMLInputElement>) => {
    setOrgFilterQuery(event.target.value || '');
  };

  return (
    <>
      <AppContentWrapper padding="48px 30px">
        <Header as="h2">Organizations</Header>
        <ElementWithButtonGrid>
          <Input onChange={handleOnChangeOrgFilter} placeholder="Filter organizations" />
          <Button color="primary" onClick={() => setIsVisibleCreateOrgModal(true)}>+ Create Organization</Button>
        </ElementWithButtonGrid>
      </AppContentWrapper>
      <AppContentWrapper>
        {
          !filteredOrganizations.isEmpty() && (
            <CardStack>
              {
                filteredOrganizations.valueSeq().map((org :Organization) => (
                  <SimpleOrganizationCard key={org.id} organization={org} />
                ))
              }
            </CardStack>
          )
        }
      </AppContentWrapper>
      {
        isVisibleAddOrgModal && (
          <CreateOrgModal onClose={() => setIsVisibleCreateOrgModal(false)} />
        )
      }
    </>
  );
};

export default OrgsContainer;
