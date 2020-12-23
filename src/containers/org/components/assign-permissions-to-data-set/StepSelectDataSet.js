/*
 * @flow
 */

import React, { useState } from 'react';

import styled from 'styled-components';
import { Map, Set } from 'immutable';
import {
  CardSegment,
  Checkbox,
  PaginationToolbar,
  Radio,
  Typography,
} from 'lattice-ui-kit';
import { LangUtils, ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { EntitySet, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  DataSetTitle,
  SearchForm,
  SpaceBetweenGrid,
  Spinner,
  StackGrid,
} from '../../../../components';
import { ATLAS_DATA_SET_IDS, ENTITY_SET_IDS, SEARCH } from '../../../../core/redux/constants';
import {
  selectAtlasDataSets,
  selectSearchHits,
  selectSearchPage,
  selectSearchQuery,
  selectSearchTotalHits,
} from '../../../../core/redux/selectors';
import {
  SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS,
  searchDataSetsToAssignPermissions,
} from '../../../../core/search/actions';
import { MAX_HITS_10 } from '../../../../core/search/constants';
import { getDataSetField } from '../../../../utils';

const { isNonEmptyString } = LangUtils;
const { selectEntitySets } = ReduxUtils;

const PaginationWrapper = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: 1fr auto;
`;

const StepSelectDataSet = ({
  organizationId,
  setTargetDataSetId,
  setTargetDataSetTitle,
  targetDataSetId,
} :{
  organizationId :UUID;
  setTargetDataSetId :(id :UUID) => void;
  setTargetDataSetTitle :(title :string) => void;
  targetDataSetId :UUID;
}) => {

  const dispatch = useDispatch();
  const [searchOnlyOrgDataSets, setSearchOnlyOrgDataSets] = useState(true);

  const searchDataSetsRS :?RequestState = useRequestState([SEARCH, SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS]);

  const searchPage :number = useSelector(selectSearchPage(SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS));
  const searchQuery :string = useSelector(selectSearchQuery(SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS));
  const searchTotalHits :Map = useSelector(selectSearchTotalHits(SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS));
  const searchHits :Map = useSelector(selectSearchHits(SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS));

  const atlasDataSetIds :Set<UUID> = searchHits.get(ATLAS_DATA_SET_IDS, Set());
  const entitySetIds :Set<UUID> = searchHits.get(ENTITY_SET_IDS, Set());
  const pageAtlasDataSets :Map<UUID, Map> = useSelector(selectAtlasDataSets(atlasDataSetIds));
  const pageEntitySets :Map<UUID, EntitySet> = useSelector(selectEntitySets(entitySetIds));

  const dispatchDataSetSearch = (params :{ page ?:number, query ?:string, start ?:number } = {}) => {
    const { page = 0, query = searchQuery, start = 0 } = params;
    if (isNonEmptyString(query)) {
      dispatch(
        searchDataSetsToAssignPermissions({
          organizationId,
          page,
          query,
          start,
          all: !searchOnlyOrgDataSets,
          maxHits: MAX_HITS_10,
        })
      );
    }
  };

  const handleOnChangeSelectDataSet = (event :SyntheticInputEvent<HTMLInputElement>) => {
    const id = event.currentTarget.dataset.id;
    const title = event.currentTarget.dataset.title;
    setTargetDataSetId(id);
    setTargetDataSetTitle(title);
  };

  return (
    <StackGrid gap={32}>
      <StackGrid>
        <Typography>
          Search for a data set to assign permissions.
        </Typography>
        <SearchForm
            onSubmit={(query :string) => dispatchDataSetSearch({ query })}
            searchRequestState={searchDataSetsRS} />
        <Checkbox
            checked={searchOnlyOrgDataSets}
            label="Search only for data sets that belong to this organization"
            onChange={() => setSearchOnlyOrgDataSets(!searchOnlyOrgDataSets)} />
      </StackGrid>
      {
        searchDataSetsRS === RequestStates.PENDING && (
          <Spinner />
        )
      }
      {
        searchDataSetsRS === RequestStates.SUCCESS && (
          <StackGrid>
            <PaginationWrapper>
              <Typography variant="h4">Entity Sets</Typography>
              <PaginationToolbar
                  count={searchTotalHits.get(ENTITY_SET_IDS)}
                  onPageChange={({ page, start }) => dispatchDataSetSearch({ page, start })}
                  page={searchPage}
                  rowsPerPage={MAX_HITS_10} />
            </PaginationWrapper>
            {
              !pageEntitySets.isEmpty() && (
                <div>
                  {
                    pageEntitySets.valueSeq().map((dataSet :EntitySet) => (
                      <CardSegment key={dataSet.id} padding="8px 0">
                        <SpaceBetweenGrid>
                          <div>
                            <DataSetTitle dataSet={dataSet} />
                            <Typography variant="caption">{dataSet.id}</Typography>
                          </div>
                          <Radio
                              checked={targetDataSetId === dataSet.id}
                              data-id={dataSet.id}
                              data-title={dataSet.title || dataSet.name}
                              name="select-data-set"
                              onChange={handleOnChangeSelectDataSet} />
                        </SpaceBetweenGrid>
                      </CardSegment>
                    ))
                  }
                </div>
              )
            }
          </StackGrid>
        )
      }
      {
        searchDataSetsRS === RequestStates.SUCCESS && (
          <StackGrid>
            <PaginationWrapper>
              <Typography variant="h4">Atlas Data Sets</Typography>
              <PaginationToolbar
                  count={searchTotalHits.get(ATLAS_DATA_SET_IDS)}
                  onPageChange={({ page, start }) => dispatchDataSetSearch({ page, start })}
                  page={searchPage}
                  rowsPerPage={MAX_HITS_10} />
            </PaginationWrapper>
            {
              !pageAtlasDataSets.isEmpty() && (
                <div>
                  {
                    pageAtlasDataSets.valueSeq().map((dataSet :EntitySet | Map) => {
                      const id :UUID = getDataSetField(dataSet, 'id');
                      const name :string = getDataSetField(dataSet, 'name');
                      const title :string = getDataSetField(dataSet, 'title');
                      return (
                        <CardSegment key={id} padding="8px 0">
                          <SpaceBetweenGrid>
                            <div>
                              <DataSetTitle dataSet={dataSet} />
                              <Typography variant="caption">{id}</Typography>
                            </div>
                            <Radio
                                checked={targetDataSetId === id}
                                data-id={id}
                                data-title={title || name}
                                name="select-data-set"
                                onChange={handleOnChangeSelectDataSet} />
                          </SpaceBetweenGrid>
                        </CardSegment>
                      );
                    })
                  }
                </div>
              )
            }
          </StackGrid>
        )
      }
    </StackGrid>
  );
};

export default StepSelectDataSet;
