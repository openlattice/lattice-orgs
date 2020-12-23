/*
 * @flow
 */

import React, { useReducer, useState } from 'react';

import { faPlus } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import {
  AppContentWrapper,
  Button,
  CardStack,
  PaginationToolbar,
  SearchInput,
} from 'lattice-ui-kit';
import { useSelector } from 'react-redux';
import type { Organization, UUID } from 'lattice';

import { ActionsGrid, Header, SimpleOrganizationCard } from '../../components';
import { ORGANIZATIONS, ORGS } from '../../core/redux/constants';
import {
  FILTER,
  INITIAL_PAGINATION_STATE,
  PAGE,
  paginationReducer,
} from '../../utils/stateReducers/pagination';
import { CreateOrgModal } from '../org/components';

const MAX_PER_PAGE = 10;

const PlusIcon = (
  <FontAwesomeIcon fixedWidth icon={faPlus} />
);

const OrgsContainer = () => {

  const [isVisibleAddOrgModal, setIsVisibleCreateOrgModal] = useState(false);
  const [paginationState, paginationDispatch] = useReducer(paginationReducer, INITIAL_PAGINATION_STATE);

  const organizations :Map<UUID, Organization> = useSelector((s) => s.getIn([ORGANIZATIONS, ORGS]));
  const filteredOrganizations = organizations.filter((org :Organization, orgId :UUID) => (
    org && (paginationState.query === orgId || org.title.toLowerCase().includes(paginationState.query.toLowerCase()))
  ));
  const filteredOrganizationsCount = filteredOrganizations.count();
  const pageOrganizations :Map<UUID, Organization> = filteredOrganizations.slice(
    paginationState.start,
    paginationState.start + MAX_PER_PAGE,
  );

  const handleOnChangeOrgFilter = (event :SyntheticInputEvent<HTMLInputElement>) => {
    paginationDispatch({ type: FILTER, query: event.target.value || '' });
  };

  const handleOnPageChange = ({ page, start }) => {
    paginationDispatch({ type: PAGE, page, start });
  };

  return (
    <>
      <AppContentWrapper>
        <Header as="h2">Organizations</Header>
        <ActionsGrid>
          <SearchInput onChange={handleOnChangeOrgFilter} placeholder="Filter organizations" />
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
                      page={paginationState.page}
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
