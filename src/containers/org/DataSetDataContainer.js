/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import { List, Map, set } from 'immutable';
import {
  AppContentWrapper,
  PaginationToolbar,
  Table,
  Typography,
} from 'lattice-ui-kit';
import { DataUtils, LangUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { FQN, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  DataTableWrapper,
  SearchForm,
  Spinner,
  StackGrid,
} from '../../components';
import { FQNS } from '../../core/edm/constants';
import { SEARCH } from '../../core/redux/constants';
import {
  selectOrgDataSetColumns,
  selectSearchHits,
  selectSearchPage,
  selectSearchQuery,
  selectSearchTotalHits,
} from '../../core/redux/selectors';
import { SEARCH_DATA, clearSearchState, searchData } from '../../core/search/actions';
import { MAX_HITS_10 } from '../../core/search/constants';

const { getEntityKeyId, getPropertyValue } = DataUtils;
const { isNonEmptyString } = LangUtils;

const DataSetDataContainer = ({
  dataSetId,
  organizationId,
} :{|
  dataSetId :UUID;
  organizationId :UUID;
|}) => {

  const dispatch = useDispatch();
  const [tableData, setTableData] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);

  const searchDataSetDataRS :?RequestState = useRequestState([SEARCH, SEARCH_DATA]);

  const dataSetColumns :List<Map<FQN, List>> = useSelector(selectOrgDataSetColumns(organizationId, dataSetId));
  const searchHits :List = useSelector(selectSearchHits(SEARCH_DATA));
  const searchPage :number = useSelector(selectSearchPage(SEARCH_DATA));
  const searchQuery :string = useSelector(selectSearchQuery(SEARCH_DATA));
  const searchTotalHits :number = useSelector(selectSearchTotalHits(SEARCH_DATA));

  useEffect(() => {
    const data :List = searchHits.map((entity :Map) => set(entity, 'id', getEntityKeyId(entity)));
    const headers :List = dataSetColumns.map((column :Map<FQN, List>) => {
      // TODO: these will have to change because the mapping is inconsistent, for example, "ol.column_name" is actually
      // the FQN for some reason
      const fqn :string = getPropertyValue(column, [FQNS.OL_COLUMN_NAME, 0]);
      const title :string = getPropertyValue(column, [FQNS.OL_DESCRIPTION, 0]);
      return { key: fqn, label: `${title} (${fqn})`, sortable: false };
    });
    setTableData(data.toJS());
    setTableHeaders(headers.toJS());
  }, [dataSetColumns, searchHits]);

  useEffect(() => () => {
    dispatch(clearSearchState(SEARCH_DATA));
  }, [dispatch]);

  const dispatchSearch = (params :{ page ?:number, query ?:string, start ?:number } = {}) => {
    const { page = 1, query = searchQuery, start = 0 } = params;
    if (isNonEmptyString(query)) {
      dispatch(
        searchData({
          page,
          query,
          start,
          entitySetId: dataSetId,
          maxHits: MAX_HITS_10,
        })
      );
    }
    else {
      dispatch(clearSearchState(SEARCH_DATA));
    }
  };

  return (
    <AppContentWrapper>
      <StackGrid gap={16}>
        <SearchForm
            onSubmit={(query :string) => dispatchSearch({ query })}
            searchRequestState={searchDataSetDataRS} />
        {
          <PaginationToolbar
              count={searchTotalHits}
              onPageChange={({ page, start }) => dispatchSearch({ page, start })}
              page={searchPage}
              rowsPerPage={MAX_HITS_10} />
        }
        {
          searchDataSetDataRS === RequestStates.PENDING && (
            <Spinner />
          )
        }
        {
          searchDataSetDataRS === RequestStates.SUCCESS && searchHits.count() === 0 && (
            <Typography>No search results.</Typography>
          )
        }
        {
          searchDataSetDataRS === RequestStates.SUCCESS && searchHits.count() > 0 && (
            <DataTableWrapper>
              <Table data={tableData} headers={tableHeaders} />
            </DataTableWrapper>
          )
        }
      </StackGrid>
    </AppContentWrapper>
  );
};

export default DataSetDataContainer;
