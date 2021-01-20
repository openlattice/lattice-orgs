/*
 * @flow
 */

import React, { useEffect } from 'react';

import { List, Map } from 'immutable';
import { AppContentWrapper, PaginationToolbar, Typography } from 'lattice-ui-kit';
import { DataUtils, LangUtils, useRequestState } from 'lattice-utils';
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
import { SEARCH } from '../../core/redux/constants';
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

const { getEntityKeyId } = DataUtils;
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
  const searchPage :number = useSelector(selectSearchPage(SEARCH_DATA));
  const searchQuery :string = useSelector(selectSearchQuery(SEARCH_DATA));
  const searchHits :List = useSelector(selectSearchHits(SEARCH_DATA));
  const searchTotalHits :number = useSelector(selectSearchTotalHits(SEARCH_DATA));

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
                      count={searchTotalHits}
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
                  searchHits.valueSeq().map((searchHit :Map) => (
                    <DataSetSearchResultCard
                        key={getEntityKeyId(searchHit)}
                        searchHit={searchHit}
                        organizationId={organizationId} />
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
