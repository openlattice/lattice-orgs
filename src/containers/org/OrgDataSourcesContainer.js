/*
 * @flow
 */

import React, { useEffect, useReducer, useState } from 'react';

import { List, Map, get } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import {
  AppContentWrapper,
  CardSegment,
  PaginationToolbar,
  SearchInput,
  Typography,
} from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  ActionsGrid,
  CrumbItem,
  CrumbLink,
  Crumbs,
  PlusButton,
  StackGrid,
} from '../../components';
import {
  selectCurrentUserIsOrgOwner,
  selectOrganization,
  selectOrganizationDataSources,
} from '../../core/redux/selectors';
import {
  FILTER,
  INITIAL_PAGINATION_STATE,
  PAGE,
  paginationReducer,
} from '../../utils/stateReducers/pagination';

const MAX_PER_PAGE = 20;

const { getOrganizationDataSources } = OrganizationsApiActions;

const OrgDataSourcesContainer = ({
  organizationId,
  organizationRoute,
} :{|
  organizationId :UUID;
  organizationRoute :string;
|}) => {

  const dispatch = useDispatch();
  const [paginationState, paginationDispatch] = useReducer(paginationReducer, INITIAL_PAGINATION_STATE);
  const [isVisibleOrgDataSourceModal, setIsVisibleOrgDataSourceModal] = useState(false);
  const [targetDataSource, setTargetDataSource] = useState(false);

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const dataSources :List<Map> = useSelector(selectOrganizationDataSources(organizationId));
  const isOwner :boolean = useSelector(selectCurrentUserIsOrgOwner(organizationId));

  useEffect(() => {
    dispatch(getOrganizationDataSources(organizationId));
  }, [dispatch, organizationId]);

  if (organization) {

    let filteredDataSources :List<Map> = dataSources;
    if (paginationState.query) {
      filteredDataSources = filteredDataSources.filter((dataSource :Map) => (
        get(dataSource, 'name', '').toLowerCase().includes(paginationState.query.toLowerCase())
      ));
    }

    const pageDataSources = filteredDataSources.slice(paginationState.start, paginationState.start + MAX_PER_PAGE);

    const handleOnChangeFilterQuery = (event :SyntheticInputEvent<HTMLInputElement>) => {
      paginationDispatch({ type: FILTER, query: event.target.value || '' });
    };

    const handleOnPageChange = ({ page, start }) => {
      paginationDispatch({ type: PAGE, page, start });
    };

    return (
      <AppContentWrapper>
        <Crumbs>
          <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
          <CrumbItem>Data Sources</CrumbItem>
        </Crumbs>
        <StackGrid gap={24}>
          <StackGrid>
            <Typography variant="h1">Data Sources</Typography>
            <Typography>
              Manage organization data sources.
            </Typography>
          </StackGrid>
          <ActionsGrid>
            <SearchInput onChange={handleOnChangeFilterQuery} placeholder="Filter data sources" />
            {
              isOwner && (
                <PlusButton aria-label="add data source" isDisabled onClick={() => {}}>
                  <Typography component="span">Add Data Source</Typography>
                </PlusButton>
              )
            }
          </ActionsGrid>
          <div>
            {
              filteredDataSources.count() > MAX_PER_PAGE && (
                <PaginationToolbar
                    count={filteredDataSources.count()}
                    onPageChange={handleOnPageChange}
                    page={paginationState.page}
                    rowsPerPage={MAX_PER_PAGE} />
              )
            }
            {
              pageDataSources.map((dataSource :Map) => {
                const name = get(dataSource, 'name', '');
                return (
                  <CardSegment key={name} onClick={() => {}} padding="24px 0">
                    <Typography component="span">{name}</Typography>
                  </CardSegment>
                );
              })
            }
          </div>
        </StackGrid>
      </AppContentWrapper>
    );
  }

  return null;
};

export default OrgDataSourcesContainer;
