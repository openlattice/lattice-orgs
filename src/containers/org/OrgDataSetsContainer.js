/*
 * @flow
 */

import React, { useMemo } from 'react';

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
import { Routes } from '../../core/router';
import {
  SEARCH_ORGANIZATION_DATA_SETS,
  clearSearchState,
  searchOrganizationDataSets,
} from '../../core/search/actions';
import { MAX_HITS_10 } from '../../core/search/constants';

const { isNonEmptyString } = LangUtils;

const OrgDataSetsContainer = ({
  organizationId,
} :{|
  organizationId :UUID;
|}) => {

  const dispatch = useDispatch();

  const searchOrgDataSetsRS :?RequestState = useRequestState([SEARCH, SEARCH_ORGANIZATION_DATA_SETS]);

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const searchPage :number = useSelector(selectSearchPage(SEARCH_ORGANIZATION_DATA_SETS));
  const searchQuery :string = useSelector(selectSearchQuery(SEARCH_ORGANIZATION_DATA_SETS));
  const searchTotalHits :number = useSelector(selectSearchTotalHits(SEARCH_ORGANIZATION_DATA_SETS));
  const searchHits :Map = useSelector(selectSearchHits(SEARCH_ORGANIZATION_DATA_SETS));

  const atlasDataSetIds :Set<UUID> = searchHits.get(ATLAS_DATA_SET_IDS, Set());
  const entitySetIds :Set<UUID> = searchHits.get(ENTITY_SET_IDS, Set());
  const pageDataSetIds :Set<UUID> = Set().union(atlasDataSetIds).union(entitySetIds);

  const orgPath = useMemo(() => (
    Routes.ORG.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  const dispatchDataSetSearch = (params :{ page ?:number, query ?:string, start ?:number } = {}) => {
    const { page = 0, query = searchQuery, start = 0 } = params;
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

  if (organization) {
    return (
      <>
        <AppContentWrapper>
          <Crumbs>
            <CrumbLink to={orgPath}>{organization.title || 'Organization'}</CrumbLink>
            <CrumbItem>Data Sets</CrumbItem>
          </Crumbs>
          <Typography variant="h1">Data Sets</Typography>
        </AppContentWrapper>
        <AppContentWrapper>
          <StackGrid gap={16}>
            <SearchForm
                onSubmit={(query :string) => dispatchDataSetSearch({ query })}
                searchRequestState={searchOrgDataSetsRS} />
            {
              <PaginationToolbar
                  count={searchTotalHits}
                  onPageChange={({ page, start }) => dispatchDataSetSearch({ page, start })}
                  page={searchPage}
                  rowsPerPage={MAX_HITS_10} />
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
        </AppContentWrapper>
      </>
    );
  }

  return null;
};

export default OrgDataSetsContainer;
