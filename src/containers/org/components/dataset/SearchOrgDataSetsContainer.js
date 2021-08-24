/*
 * @flow
 */

import React, { useCallback, useEffect, useState } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  CardSegment,
  Checkbox,
  PaginationToolbar,
  Typography,
} from 'lattice-ui-kit';
import { LangUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  DataSetTitle,
  SearchForm,
  SpaceBetweenGrid,
  StackGrid,
} from '../../../../components';
import { getOrgDataSetObjectPermissions } from '../../../../core/permissions/actions';
import { SEARCH } from '../../../../core/redux/constants';
import {
  selectMyKeys,
  selectSearchHits,
  selectSearchPage,
  selectSearchQuery,
  selectSearchTotalHits,
} from '../../../../core/redux/selectors';
import {
  SEARCH_ORGANIZATION_DATA_SETS,
  searchOrganizationDataSets,
} from '../../../../core/search/actions';
import { MAX_HITS_10 } from '../../../../core/search/constants';
import {
  ID,
  METADATA,
  NAME,
  TITLE,
} from '../../../../utils/constants';

const { isNonEmptyString } = LangUtils;

const PaginationWrapper = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: 1fr auto;
`;

const SearchOrgDataSetsContainer = ({
  excludedDataSets = List(),
  organizationId,
  ownerRequired,
  setTargetDataSetIds,
  setTargetDataSetTitles,
  targetDataSetIds,
  targetDataSetTitles
} :{
  excludedDataSets ?:List<UUID>;
  organizationId :UUID;
  ownerRequired ?:boolean;
  setTargetDataSetIds :(ids :List<UUID>) => void;
  setTargetDataSetTitles :(titles :List<string>) => void;
  targetDataSetIds :List<UUID>;
  targetDataSetTitles :List<string>;
}) => {

  const dispatch = useDispatch();
  const [searchId, setSearchId] = useState();

  const searchOrgDataSetsRS :?RequestState = useRequestState([SEARCH, SEARCH_ORGANIZATION_DATA_SETS]);

  const searchHits :Map = useSelector(selectSearchHits(SEARCH_ORGANIZATION_DATA_SETS));
  const searchPage :number = useSelector(selectSearchPage(SEARCH_ORGANIZATION_DATA_SETS));
  const searchQuery :string = useSelector(selectSearchQuery(SEARCH_ORGANIZATION_DATA_SETS)) || '*';
  const searchTotalHits :number = useSelector(selectSearchTotalHits(SEARCH_ORGANIZATION_DATA_SETS));

  const myKeys :Set<List<UUID>> = useSelector(selectMyKeys());
  const dataSetDisabled = (dataSetId :UUID) :boolean => excludedDataSets.includes(dataSetId)
    || (ownerRequired && !myKeys.has(List([dataSetId])));

  const dispatchDataSetSearch = useCallback((params :{ page ?:number, query ?:string, start ?:number } = {}) => {
    const { page = 0, query = searchQuery, start = 0 } = params;
    if (isNonEmptyString(query)) {
      const action = searchOrganizationDataSets({
        maxHits: MAX_HITS_10,
        organizationId,
        page,
        query,
        start,
      });
      dispatch(action);
      setSearchId(action.id);
    }
  }, [dispatch, organizationId, searchQuery]);

  useEffect(() => {
    if (!searchId) {
      dispatchDataSetSearch({ query: '*' });
    }
  }, [dispatchDataSetSearch, searchId]);

  useEffect(() => {
    if (ownerRequired) {
      const dataSetKeys :List<List<UUID>> = searchHits.map((hit :Map) => List([hit.get(ID)])).toList();
      dispatch(getOrgDataSetObjectPermissions(dataSetKeys));
    }
  }, [dispatch, ownerRequired, searchHits]);

  const handleOnChangeSelectDataSet = (event :SyntheticInputEvent<HTMLInputElement>) => {
    const { id, title } = event.currentTarget.dataset;
    if (targetDataSetIds.includes(id)) {
      setTargetDataSetIds(targetDataSetIds.filter((dataSetId) => dataSetId !== id));
    }
    else {
      setTargetDataSetIds(targetDataSetIds.push(id));
    }
    if (targetDataSetTitles.includes(title)) {
      setTargetDataSetTitles(targetDataSetTitles.filter((dataSetTitle) => dataSetTitle !== title));
    }
    else {
      setTargetDataSetTitles(targetDataSetTitles.push(title));
    }
  };

  return (
    <StackGrid>
      <SearchForm
          onSubmit={(query :string) => dispatchDataSetSearch({ query })}
          searchQuery={searchQuery}
          searchRequestState={searchOrgDataSetsRS} />
      <div>
        {
          searchHits.map((hit :Map) => {
            const id :UUID = hit.get(ID);
            const name :string = hit.get(NAME);
            const title :string = hit.getIn([METADATA, TITLE]);
            return (
              <CardSegment key={id} padding="8px 0">
                <SpaceBetweenGrid>
                  <div>
                    <DataSetTitle dataSet={hit} />
                    <Typography variant="caption">{id}</Typography>
                  </div>
                  <Checkbox
                      checked={targetDataSetIds.includes(id) || excludedDataSets.includes(id)}
                      data-id={id}
                      data-title={title || name}
                      disabled={dataSetDisabled(id)}
                      name="select-data-set"
                      onChange={handleOnChangeSelectDataSet} />
                </SpaceBetweenGrid>
              </CardSegment>
            );
          })
        }
      </div>
      {
        searchTotalHits > MAX_HITS_10 && (
          <PaginationWrapper>
            <PaginationToolbar
                count={searchTotalHits}
                onPageChange={({ page, start }) => dispatchDataSetSearch({ page, start })}
                page={searchPage}
                rowsPerPage={MAX_HITS_10} />
          </PaginationWrapper>
        )
      }
    </StackGrid>
  );
};

SearchOrgDataSetsContainer.defaultProps = {
  excludedDataSets: List(),
  ownerRequired: false
};

export default SearchOrgDataSetsContainer;
