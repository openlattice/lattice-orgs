/*
 * @flow
 */

import React, { useReducer, useState } from 'react';

import { Map } from 'immutable';
import {
  AppContentWrapper,
  PaginationToolbar,
  SearchInput,
  Typography,
} from 'lattice-ui-kit';
import { useSelector } from 'react-redux';
import type { Organization, UUID } from 'lattice';

import {
  ActionsGrid,
  PlusButton,
  SimpleOrganizationCard,
  StackGrid,
} from '../../components';
import { ORGANIZATIONS, ORGS } from '../../core/redux/constants';
import {
  FILTER,
  INITIAL_PAGINATION_STATE,
  PAGE,
  paginationReducer,
} from '../../utils/stateReducers/pagination';
import { CreateOrgModal } from '../org/components';

const MAX_PER_PAGE = 10;

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
        <StackGrid gap={32}>
          <StackGrid>
            <Typography variant="h1">Organizations</Typography>
            <Typography>Find the organizations to which you belong.</Typography>
          </StackGrid>
          <ActionsGrid>
            <SearchInput onChange={handleOnChangeOrgFilter} placeholder="Filter organizations" />
            <PlusButton aria-label="create organization" onClick={() => setIsVisibleCreateOrgModal(true)}>
              <Typography component="span">Create Organization</Typography>
            </PlusButton>
          </ActionsGrid>
          <StackGrid gap={24}>
            {
              !pageOrganizations.isEmpty() && (
                <>
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
                </>
              )
            }
          </StackGrid>
        </StackGrid>
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
