/*
 * @flow
 */

import React, { useEffect } from 'react';

import { Map, Set } from 'immutable';
import { AppContentWrapper, PaginationToolbar, Typography } from 'lattice-ui-kit';
import { LangUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { DataSetSearchResultCard } from './components';

import {
  CrumbItem,
  CrumbLink,
  Crumbs,
  SearchForm,
  Spinner,
  StackGrid,
} from '../../components';
import { ATLAS_DATA_SET_IDS, ENTITY_SET_IDS, SEARCH } from '../../core/redux/constants';
import {
  selectOrganization,
  selectSearchHits,
  selectSearchPage,
  selectSearchQuery,
  selectSearchTotalHits,
} from '../../core/redux/selectors';
import {
  SEARCH_DATA,
  SEARCH_ORGANIZATION_DATA_SETS,
  clearSearchState,
  searchOrganizationDataSets,
} from '../../core/search/actions';
import { MAX_HITS_10 } from '../../core/search/constants';

const { isNonEmptyString } = LangUtils;

const OrgDataSetsContainer = ({
  organizationId,
  organizationRoute,
} :{|
  organizationId :UUID;
  organizationRoute :string;
|}) => {

  const dispatch = useDispatch();

  const searchOrgDataSetsRS :?RequestState = useRequestState([SEARCH, SEARCH_ORGANIZATION_DATA_SETS]);

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const searchPage :number = useSelector(selectSearchPage(SEARCH_ORGANIZATION_DATA_SETS));
  const searchQuery :string = useSelector(selectSearchQuery(SEARCH_ORGANIZATION_DATA_SETS));
  const searchHits :Map = useSelector(selectSearchHits(SEARCH_ORGANIZATION_DATA_SETS));
  const searchTotalHits :Map = useSelector(selectSearchTotalHits(SEARCH_ORGANIZATION_DATA_SETS));
  const totalHits :number = searchTotalHits.get(ATLAS_DATA_SET_IDS) + searchTotalHits.get(ENTITY_SET_IDS);

  const atlasDataSetIds :Set<UUID> = searchHits.get(ATLAS_DATA_SET_IDS, Set());
  const entitySetIds :Set<UUID> = searchHits.get(ENTITY_SET_IDS, Set());
  const pageDataSetIds :Set<UUID> = Set().union(atlasDataSetIds).union(entitySetIds);

  useEffect(() => () => {
    dispatch(clearSearchState(SEARCH_DATA));
  }, [dispatch]);

  const dispatchDataSetSearch = (params :{ page ?:number, query ?:string, start ?:number } = {}) => {
    const { page = 1, query = searchQuery, start = 0 } = params;
    if (isNonEmptyString(query)) {
      dispatch(
        searchOrganizationDataSets({
          organizationId,
          page,
          query,
          start,
          maxHits: MAX_HITS_10,
        })
      );
    }
    else {
      dispatch(clearSearchState(SEARCH_ORGANIZATION_DATA_SETS));
    }
  };

  useEffect(() => {
    if (searchOrgDataSetsRS === RequestStates.STANDBY) {
      dispatch(
        searchOrganizationDataSets({
          organizationId,
          maxHits: MAX_HITS_10,
          query: '*',
        })
      );
    }
  }, [dispatch, organizationId, searchOrganizationDataSets]);

  if (organization) {
    return (
      <>
        <AppContentWrapper>
          <Crumbs>
            <CrumbLink to={organizationRoute}>{organization.title || 'Organization'}</CrumbLink>
            <CrumbItem>Data Sets</CrumbItem>
          </Crumbs>
          <StackGrid gap={48}>
            <Typography variant="h1">Data Sets</Typography>
            <StackGrid>
              <Typography>
                Search for a data set belonging to this organization. Click on a data set to view its details and
                properties.
              </Typography>
              <SearchForm
                  onSubmit={(query :string) => dispatchDataSetSearch({ query })}
                  searchQuery={searchQuery}
                  searchRequestState={searchOrgDataSetsRS} />
              {
                searchOrgDataSetsRS !== RequestStates.STANDBY && (
                  <PaginationToolbar
                      count={totalHits}
                      onPageChange={({ page, start }) => dispatchDataSetSearch({ page, start })}
                      page={searchPage}
                      rowsPerPage={MAX_HITS_10} />
                )
              }
              {
                searchOrgDataSetsRS === RequestStates.PENDING && (
                  <Spinner />
                )
              }
              {
                searchOrgDataSetsRS === RequestStates.SUCCESS && (
                  pageDataSetIds.valueSeq().map((id :UUID) => (
                    <DataSetSearchResultCard key={id} dataSetId={id} organizationId={organizationId} />
                  ))
                )
              }
            </StackGrid>
          </StackGrid>
        </AppContentWrapper>
      </>
    );
  }

  return null;
};

export default OrgDataSetsContainer;
