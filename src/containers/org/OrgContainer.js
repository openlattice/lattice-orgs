/*
 * @flow
 */

import React, { useEffect, useMemo } from 'react';

import { faUser } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import {
  AppContentWrapper,
  Colors,
  PaginationToolbar,
  Typography,
} from 'lattice-ui-kit';
import {
  DataUtils,
  LangUtils,
  ReduxUtils,
  useGoToRoute,
  useRequestState,
} from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { DELETE_EXISTING_ORGANIZATION } from './actions';
import { DataSetSearchResultCard, OrgActionButton } from './components';

import { BadgeCheckIcon } from '../../assets';
import {
  CrumbLink,
  GapGrid,
  SearchForm,
  SpaceBetweenGrid,
  Spinner,
  StackGrid,
} from '../../components';
import { resetRequestState } from '../../core/redux/actions';
import { ORGANIZATIONS, SEARCH } from '../../core/redux/constants';
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

const { PURPLE } = Colors;
const { getEntityKeyId } = DataUtils;
const { isNonEmptyString } = LangUtils;
const {
  isPending,
  isStandby,
  isSuccess,
} = ReduxUtils;

const OrgContainer = ({
  organizationId,
} :{|
  organizationId :UUID;
|}) => {

  const dispatch = useDispatch();

  const deleteOrgRS :?RequestState = useRequestState([ORGANIZATIONS, DELETE_EXISTING_ORGANIZATION]);
  const searchOrgDataSetsRS :?RequestState = useRequestState([SEARCH, SEARCH_ORGANIZATION_DATA_SETS]);

  const organization :?Organization = useSelector(selectOrganization(organizationId));
  const searchPage :number = useSelector(selectSearchPage(SEARCH_ORGANIZATION_DATA_SETS));
  const searchQuery :string = useSelector(selectSearchQuery(SEARCH_ORGANIZATION_DATA_SETS));
  const searchHits :List = useSelector(selectSearchHits(SEARCH_ORGANIZATION_DATA_SETS));
  const searchTotalHits :number = useSelector(selectSearchTotalHits(SEARCH_ORGANIZATION_DATA_SETS));

  useEffect(() => {
    if (isStandby(searchOrgDataSetsRS)) {
      dispatch(
        searchOrganizationDataSets({
          maxHits: MAX_HITS_10,
          organizationId,
          query: '*',
          start: 0,
        })
      );
    }
  }, [dispatch, organizationId, searchOrgDataSetsRS]);

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

  const goToRoot = useGoToRoute(Routes.ROOT);

  useEffect(() => {
    if (isSuccess(deleteOrgRS)) {
      setTimeout(() => {
        dispatch(resetRequestState([DELETE_EXISTING_ORGANIZATION]));
      }, 1000);
      goToRoot();
    }
  });

  const peoplePath = useMemo(() => (
    Routes.ORG_PEOPLE.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  const rolesPath = useMemo(() => (
    Routes.ORG_ROLES.replace(Routes.ORG_ID_PARAM, organizationId)
  ), [organizationId]);

  if (organization) {
    const rolesCount :number = organization.roles.length;
    const peopleCount :number = organization.members.length;
    return (
      <AppContentWrapper>
        <StackGrid gap={24}>
          <StackGrid>
            <SpaceBetweenGrid>
              <GapGrid gap={32}>
                <Typography variant="h1">{organization.title}</Typography>
                <CrumbLink to={peoplePath}>
                  <GapGrid gap={8}>
                    <FontAwesomeIcon color={PURPLE.P300} fixedWidth icon={faUser} size="lg" />
                    <Typography color="primary">{`${peopleCount} People`}</Typography>
                  </GapGrid>
                </CrumbLink>
                <CrumbLink to={rolesPath}>
                  <GapGrid gap={8}>
                    <BadgeCheckIcon />
                    <Typography color="primary">{`${rolesCount} Roles`}</Typography>
                  </GapGrid>
                </CrumbLink>
              </GapGrid>
              <OrgActionButton organization={organization} />
            </SpaceBetweenGrid>
            {
              isNonEmptyString(organization.description) && (
                <Typography>{organization.description}</Typography>
              )
            }
          </StackGrid>
          <Typography variant="h2">Data Sets</Typography>
          <SearchForm
              onSubmit={(query :string) => dispatchDataSetSearch({ query })}
              searchQuery={searchQuery}
              searchRequestState={searchOrgDataSetsRS} />
          {
            !isStandby(searchOrgDataSetsRS) && (
              <PaginationToolbar
                  count={searchTotalHits}
                  onPageChange={({ page, start }) => dispatchDataSetSearch({ page, start })}
                  page={searchPage}
                  rowsPerPage={MAX_HITS_10} />
            )
          }
          {
            isPending(searchOrgDataSetsRS) && (
              <Spinner />
            )
          }
          {
            isSuccess(searchOrgDataSetsRS) && (
              searchHits.valueSeq().map((searchHit :Map) => (
                <DataSetSearchResultCard
                    key={getEntityKeyId(searchHit)}
                    organizationId={organizationId}
                    searchResult={searchHit} />
              ))
            )
          }
        </StackGrid>
      </AppContentWrapper>
    );
  }

  return null;
};

export default OrgContainer;
