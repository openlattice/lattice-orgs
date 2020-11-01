/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import { List, Map, set } from 'immutable';
import { AppContentWrapper, PaginationToolbar, Table } from 'lattice-ui-kit';
import { DataUtils, LangUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { EntitySet, PropertyType, UUID } from 'lattice';
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
  selectEntitySetPropertyTypes,
  selectSearchHits,
  selectSearchPage,
  selectSearchQuery,
  selectSearchTotalHits,
} from '../../core/redux/selectors';
import { SEARCH_DATA, clearSearchState, searchData } from '../../core/search/actions';
import { MAX_HITS_10 } from '../../core/search/constants';

const { getPropertyValue } = DataUtils;
const { isNonEmptyString } = LangUtils;

const DataSetDataContainer = ({
  atlasDataSet,
  dataSetId,
  entitySet,
} :{|
  atlasDataSet :?Map;
  dataSetId :UUID;
  entitySet :?EntitySet;
|}) => {

  const dispatch = useDispatch();
  const [tableData, setTableData] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);

  const searchDataSetDataRS :?RequestState = useRequestState([SEARCH, SEARCH_DATA]);

  const searchPage :number = useSelector(selectSearchPage(SEARCH_DATA));
  const searchQuery :string = useSelector(selectSearchQuery(SEARCH_DATA));
  const searchTotalHits :number = useSelector(selectSearchTotalHits(SEARCH_DATA));
  const searchHits :List = useSelector(selectSearchHits(SEARCH_DATA));

  const propertyTypes :Map<UUID, PropertyType> = useSelector(selectEntitySetPropertyTypes(dataSetId));
  // BUG: unfortunately, I think hashCode() is computed every time since the Map is always "new"
  const propertyTypesHash :number = propertyTypes.hashCode();

  // OPTIMIZE: everything in this useEffect can probably be improved / optimized
  useEffect(() => {
    if (atlasDataSet) {
      const atlasDataSetTableData = searchHits
        .map((row :Map) => set(row, 'id', row.hashCode()))
        .toJS(); // TODO: avoid .toJS()
      const atlasDataSetTableHeaders = atlasDataSet
        .get('columns', List())
        .map((column) => ({
          key: column.get('id'),
          label: `${column.get('title') || column.get('name')}${column.get('primaryKey') ? ' (PK)' : ''}`,
          sortable: false,
        }))
        .toJS(); // TODO: avoid .toJS()
      setTableData(atlasDataSetTableData);
      setTableHeaders(atlasDataSetTableHeaders);
    }
    else if (entitySet) {
      const entitySetTableData = searchHits
        .map((entity :Map) => set(entity, 'id', getPropertyValue(entity, [FQNS.EKID, 0])));
        // .toJS(); // TODO: avoid .toJS()
      const entitySetTableHeaders = propertyTypes
        .valueSeq()
        .map((propertyType :PropertyType) => ({
          key: propertyType.type.toString(),
          label: `${propertyType.title} (${propertyType.type.toString()})`,
          sortable: false,
        }))
        .toJS(); // TODO: avoid .toJS()
      setTableData(entitySetTableData);
      setTableHeaders(entitySetTableHeaders);
    }
    else {
      setTableData([]);
      setTableHeaders([]);
    }
  }, [atlasDataSet, entitySet, propertyTypesHash, searchHits]);

  const dispatchSearch = (params :{ page ?:number, query ?:string, start ?:number } = {}) => {
    const { page = 0, query = searchQuery, start = 0 } = params;
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
          searchDataSetDataRS === RequestStates.SUCCESS && (
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
