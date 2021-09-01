// @flow
import React, { useState } from 'react';

import { faChevronDown } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
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

import { DataSetSearchResultCard } from './components';

import {
  Flip,
  GapGrid,
  SearchForm,
  Spinner,
  StackGrid,
} from '../../components';
import { DATA_SET_TYPE_RS_OPTIONS, ES_FLAG_TYPE_RS_OPTIONS } from '../../core/edm/constants';
import { SEARCH } from '../../core/redux/constants';
import {
  selectSearchHits,
  selectSearchPage,
  selectSearchQuery,
  selectSearchTotalHits,
} from '../../core/redux/selectors';
import {
  SEARCH_ORGANIZATION_DATA_SETS,
  clearSearchState,
  searchOrganizationDataSets,
} from '../../core/search/actions';
import { MAX_HITS_10 } from '../../core/search/constants';
import type { ReactSelectOption } from '../../types';

const { isNonEmptyString } = LangUtils;
const {
  isPending,
  isStandby,
  isSuccess,
} = ReduxUtils;

type Props = {
  organizationId :UUID;
};

const OrgDataSetsContainer = ({ organizationId } :Props) => {

  const dispatch = useDispatch();
  const [isOpenSearchOptions, setIsOpenSearchOptions] = useState(false);
  const [flag, setFlag] = useState();
  const [dataSetType, setDataSetType] = useState();

  const searchOrgDataSetsRS :?RequestState = useRequestState([SEARCH, SEARCH_ORGANIZATION_DATA_SETS]);

  const searchPage :number = useSelector(selectSearchPage(SEARCH_ORGANIZATION_DATA_SETS));
  const searchQuery :string = useSelector(selectSearchQuery(SEARCH_ORGANIZATION_DATA_SETS)) || '*';
  const searchHits :List = useSelector(selectSearchHits(SEARCH_ORGANIZATION_DATA_SETS));
  const searchTotalHits :number = useSelector(selectSearchTotalHits(SEARCH_ORGANIZATION_DATA_SETS));

  const dispatchDataSetSearch = (params :{ page ?:number, query ?:string, start ?:number } = {}) => {
    const { page = 1, query = searchQuery, start = 0 } = params;
    if (isNonEmptyString(query)) {
      dispatch(
        searchOrganizationDataSets({
          dataSetType,
          flags: [flag],
          maxHits: MAX_HITS_10,
          organizationId,
          page,
          query,
          start,
        })
      );
    }
    else {
      dispatch(clearSearchState(SEARCH_ORGANIZATION_DATA_SETS));
    }
  };

  const toggleSearchOptions = () => setIsOpenSearchOptions(!isOpenSearchOptions);

  return (
    <StackGrid>
      <StackGrid gap={8}>
        <SearchForm
            onSubmit={(query :string) => dispatchDataSetSearch({ query })}
            searchQuery={searchQuery}
            searchRequestState={searchOrgDataSetsRS} />
        <GapGrid gap={8}>
          <Typography variant="subtitle2">Search Options</Typography>
          <Flip flip={isOpenSearchOptions}>
            <IconButton aria-label="toggle search options" onClick={toggleSearchOptions}>
              <FontAwesomeIcon fixedWidth icon={faChevronDown} size="xs" />
            </IconButton>
          </Flip>
        </GapGrid>
        <Collapse in={isOpenSearchOptions}>
          <Grid container justifyContent="flex-start" spacing={2}>
            <Grid item xs={2}>
              <Box>
                <Typography gutterBottom variant="subtitle1">Data Set Types</Typography>
                <Select
                    isClearable
                    onChange={(option :?ReactSelectOption<string>) => setDataSetType(option?.value)}
                    options={DATA_SET_TYPE_RS_OPTIONS} />
              </Box>
            </Grid>
            <Grid item xs={2}>
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
        isPending(searchOrgDataSetsRS) && (
          <Spinner />
        )
      }
      {
        isSuccess(searchOrgDataSetsRS) && searchHits.isEmpty() && (
          <Typography align="center">No data sets.</Typography>
        )
      }
      {
        isSuccess(searchOrgDataSetsRS) && !searchHits.isEmpty() && (
          <StackGrid>
            {
              searchHits.valueSeq().map((searchHit :Map) => (
                <DataSetSearchResultCard
                    dataSet={searchHit}
                    key={searchHit.get('id')}
                    organizationId={organizationId} />
              ))
            }
          </StackGrid>
        )
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

export default OrgDataSetsContainer;
