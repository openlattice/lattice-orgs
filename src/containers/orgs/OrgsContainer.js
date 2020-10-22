/*
 * @flow
 */

import React, { useState } from 'react';

import { faPlus } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import {
  AppContentWrapper,
  Button,
  CardStack,
  Input,
  PaginationToolbar,
} from 'lattice-ui-kit';
import { useSelector } from 'react-redux';
import type { Organization, UUID } from 'lattice';

import { ActionsGrid, Header, SimpleOrganizationCard } from '../../components';
import { ORGANIZATIONS, ORGS } from '../../core/redux/constants';
import { CreateOrgModal } from '../org/components';

const MAX_PER_PAGE = 10;

const PlusIcon = (
  <FontAwesomeIcon fixedWidth icon={faPlus} />
);

const OrgsContainer = () => {

  const [isVisibleAddOrgModal, setIsVisibleCreateOrgModal] = useState(false);
  const [orgFilterQuery, setOrgFilterQuery] = useState('');
  const [paginationIndex, setPaginationIndex] = useState(0);
  const [paginationPage, setPaginationPage] = useState(0);

  const organizations :Map<UUID, Organization> = useSelector((s) => s.getIn([ORGANIZATIONS, ORGS]));
  const filteredOrganizations = organizations.filter((org :Organization, orgId :UUID) => (
    org && (orgFilterQuery === orgId || org.title.toLowerCase().includes(orgFilterQuery))
  ));
  const filteredOrganizationsCount = filteredOrganizations.count();
  const pageOrganizations :Map<UUID, Organization> = filteredOrganizations.slice(
    paginationIndex,
    paginationIndex + MAX_PER_PAGE,
  );

  const handleOnChangeOrgFilter = (event :SyntheticInputEvent<HTMLInputElement>) => {
    setOrgFilterQuery(event.target.value || '');
  };

  const handleOnPageChange = ({ page, start }) => {
    setPaginationIndex(start);
    setPaginationPage(page);
  };

  return (
    <>
      <AppContentWrapper>
        <Header as="h2">Organizations</Header>
        <ActionsGrid>
          <Input onChange={handleOnChangeOrgFilter} placeholder="Filter organizations" />
          <Button
              color="primary"
              onClick={() => setIsVisibleCreateOrgModal(true)}
              startIcon={PlusIcon}>
            Create Organization
          </Button>
        </ActionsGrid>
      </AppContentWrapper>
      <AppContentWrapper>
        {
          !pageOrganizations.isEmpty() && (
            <CardStack>
              {
                filteredOrganizationsCount > MAX_PER_PAGE && (
                  <PaginationToolbar
                      page={paginationPage}
                      count={filteredOrganizationsCount}
                      onPageChange={handleOnPageChange}
                      rowsPerPage={MAX_PER_PAGE} />
                )
              }
              {
                pageOrganizations.valueSeq().map((org :Organization) => (
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
