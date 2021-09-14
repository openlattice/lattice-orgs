/*
 * @flow
 */

import React, { useCallback, useEffect, useState } from 'react';

import { faChevronDown } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List } from 'immutable';
import {
  Box,
  Collapse,
  Grid,
  IconButton,
  PaginationToolbar,
  Select,
  Typography,
} from 'lattice-ui-kit';
import {
  LangUtils,
  ReduxUtils,
  useRequestState,
} from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  Flip,
  GapGrid,
  SearchForm,
  Spinner,
  StackGrid,
} from '../../../../components';
import { DATA_SET_TYPE_RS_OPTIONS, ES_FLAG_TYPE_RS_OPTIONS } from '../../../../core/edm/constants';
import {
  GET_ORG_DATA_SET_OBJECT_PERMISSIONS,
  getOrgDataSetObjectPermissions,
} from '../../../../core/permissions/actions';
import { resetRequestStates } from '../../../../core/redux/actions';
import { PERMISSIONS, SEARCH } from '../../../../core/redux/constants';
import {
  selectSearchHits,
  selectSearchPage,
  selectSearchQuery,
  selectSearchTotalHits,
} from '../../../../core/redux/selectors';
import {
  SEARCH_ORGANIZATION_DATA_SETS,
  clearSearchState,
  searchOrganizationDataSets,
} from '../../../../core/search/actions';
import { MAX_HITS_10 } from '../../../../core/search/constants';
import { ID } from '../../../../utils/constants';
import type { DataSetType } from '../../../../core/edm/constants';
import type { ReactSelectOption } from '../../../../types';

const { isNonEmptyString } = LangUtils;
const {
  isPending,
  isStandby,
  isSuccess,
  reduceRequestStates,
} = ReduxUtils;

const SearchOrgDataSetsContainer = ({
  children,
  filterByDataSetType,
  organizationId,
} :{
  children :any;
  filterByDataSetType ?:DataSetType;
  organizationId :UUID;
}) => {

  const dispatch = useDispatch();
  const [dataSetType, setDataSetType] = useState(filterByDataSetType);
  const [flag, setFlag] = useState();
  const [isOpenSearchOptions, setIsOpenSearchOptions] = useState(false);
  const [searchId, setSearchId] = useState();

  const searchOrgDataSetsRS :?RequestState = useRequestState([SEARCH, SEARCH_ORGANIZATION_DATA_SETS]);
  const getPermissionsRS :?RequestState = useRequestState([PERMISSIONS, GET_ORG_DATA_SET_OBJECT_PERMISSIONS]);

  const searchPage :number = useSelector(selectSearchPage(SEARCH_ORGANIZATION_DATA_SETS));
  const searchQuery :string = useSelector(selectSearchQuery(SEARCH_ORGANIZATION_DATA_SETS)) || '*';
  const searchHits :List = useSelector(selectSearchHits(SEARCH_ORGANIZATION_DATA_SETS));
  const searchTotalHits :number = useSelector(selectSearchTotalHits(SEARCH_ORGANIZATION_DATA_SETS));

  const dispatchDataSetSearch = useCallback((params :{ page ?:number, query ?:string, start ?:number } = {}) => {
    const { page = 1, query = searchQuery, start = 0 } = params;
    if (isNonEmptyString(query)) {
      const action = searchOrganizationDataSets({
        dataSetType,
        flags: [flag],
        maxHits: MAX_HITS_10,
        organizationId,
        page,
        query,
        start,
      });
      dispatch(action);
      setSearchId(action.id);
      dispatch(resetRequestStates([GET_ORG_DATA_SET_OBJECT_PERMISSIONS]));
    }
    else {
      dispatch(clearSearchState(SEARCH_ORGANIZATION_DATA_SETS));
    }
  }, [dispatch, dataSetType, flag, organizationId, searchQuery]);

  useEffect(() => {
    if (!searchId) {
      dispatchDataSetSearch({ query: '*' });
    }
  }, [dispatchDataSetSearch, searchId]);

  useEffect(() => {
    const dataSetKeys :List<List<UUID>> = searchHits.map((hit) => List([hit.get(ID)])).toList();
    dispatch(getOrgDataSetObjectPermissions(dataSetKeys));
  }, [dispatch, searchHits]);

  const toggleSearchOptions = () => setIsOpenSearchOptions(!isOpenSearchOptions);

  const reducedRS = reduceRequestStates([searchOrgDataSetsRS, getPermissionsRS]);

  return (
    <StackGrid>
      <StackGrid gap={8}>
        <SearchForm
            isPending={isPending(reducedRS)}
            onSubmit={(query :string) => dispatchDataSetSearch({ query })}
            searchQuery={searchQuery} />
        <GapGrid gap={8}>
          <Typography variant="subtitle2">Search Options</Typography>
          <Flip flip={isOpenSearchOptions}>
            <IconButton aria-label="toggle search options" onClick={toggleSearchOptions}>
              <FontAwesomeIcon fixedWidth icon={faChevronDown} size="xs" />
            </IconButton>
          </Flip>
        </GapGrid>
        <Collapse in={isOpenSearchOptions}>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Box>
                <Typography gutterBottom variant="subtitle1">Data Set Types</Typography>
                <Select
                    isClearable
                    onChange={(option :?ReactSelectOption<string>) => setDataSetType(option?.value)}
                    options={DATA_SET_TYPE_RS_OPTIONS}
                    value={DATA_SET_TYPE_RS_OPTIONS.find((o) => o.value === dataSetType)} />
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box>
                <Typography gutterBottom variant="subtitle1">Flags</Typography>
                <Select
                    isClearable
                    onChange={(option :?ReactSelectOption<string>) => setFlag(option?.value)}
                    options={ES_FLAG_TYPE_RS_OPTIONS} />
              </Box>
            </Grid>
          </Grid>
        </Collapse>
      </StackGrid>
      {
        isPending(reducedRS) && (
          <Spinner />
        )
      }
      {
        isSuccess(searchOrgDataSetsRS) && searchHits.isEmpty() && (
          <Typography align="center">No data sets.</Typography>
        )
      }
      {
        isSuccess(reducedRS) && !searchHits.isEmpty() && children(searchHits)
      }
      {
        !isStandby(searchOrgDataSetsRS) && (
          <PaginationToolbar
              count={searchTotalHits}
              onPageChange={({ page, start }) => dispatchDataSetSearch({ page, start })}
              page={searchPage}
              rowsPerPage={MAX_HITS_10} />
        )
      }
    </StackGrid>
  );
};

SearchOrgDataSetsContainer.defaultProps = {
  filterByDataSetType: undefined,
};

export default SearchOrgDataSetsContainer;
