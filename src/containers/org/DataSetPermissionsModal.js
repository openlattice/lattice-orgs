/*
 * @flow
 */

import React from 'react';

import _isFunction from 'lodash/isFunction';
import { Map, Set, getIn } from 'immutable';
import {
  Modal,
  ModalFooter,
  PaginationToolbar,
  Radio,
  Typography,
} from 'lattice-ui-kit';
import { LangUtils, ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { EntitySet, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { SearchDataSetsForm } from './components';

import { GridCardSegment, Spinner, StackGrid } from '../../components';
import { SEARCH } from '../../core/redux/constants';
import {
  selectAtlasDataSets,
  selectSearchHits,
  selectSearchPage,
  selectSearchQuery,
  selectSearchTotalHits,
} from '../../core/redux/selectors';
import {
  SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS,
  clearSearchState,
  searchDataSetsToAssignPermissions,
} from '../../core/search/actions';

const { isNonEmptyString } = LangUtils;
const { selectEntitySets } = ReduxUtils;

const MAX_PER_PAGE = 10;

const DataSetPermissionsModal = ({
  onClose,
} :{|
  onClose :() => void;
|}) => {

  const dispatch = useDispatch();

  const searchDataSetsRS :?RequestState = useRequestState([SEARCH, SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS]);

  const searchPage :number = useSelector(selectSearchPage(SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS));
  const searchQuery :string = useSelector(selectSearchQuery(SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS));
  const searchTotalHits :number = useSelector(selectSearchTotalHits(SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS));
  const searchHits :Set<UUID> = useSelector(selectSearchHits(SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS));

  const pageAtlasDataSets :Map<UUID, Map> = useSelector(selectAtlasDataSets(searchHits));
  const pageEntitySets :Map<UUID, EntitySet> = useSelector(selectEntitySets(searchHits));
  const pageDataSets :Map<UUID, EntitySet | Map> = Map().merge(pageAtlasDataSets).merge(pageEntitySets);

  const dispatchDataSetSearch = (params :{ page ?:number, query ?:string, start ?:number } = {}) => {
    const { page = 0, query = searchQuery, start = 0 } = params;
    if (isNonEmptyString(query)) {
      dispatch(
        searchDataSetsToAssignPermissions({
          page,
          query,
          start,
          maxHits: MAX_PER_PAGE,
        })
      );
    }
    else {
      dispatch(clearSearchState(SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS));
    }
  };

  const handleOnClose = () => {
    if (_isFunction(onClose)) {
      onClose();
    }
    // the timeout avoids rendering the modal with new state before the transition animation finishes
    setTimeout(() => {
      dispatch(clearSearchState(SEARCH_DATA_SETS_TO_ASSIGN_PERMISSIONS));
    }, 1000);
  };

  const handleOnSubmitDataSetQuery = (query :string) => {
    dispatchDataSetSearch({ query });
  };

  const handleOnPageChange = ({ page, start }) => {
    dispatchDataSetSearch({ page, start });
  };

  const withFooter = (
    <ModalFooter
        shouldStretchButtons
        textPrimary="Continue"
        textSecondary="" />
  );

  return (
    <Modal
        isVisible
        onClose={handleOnClose}
        shouldStretchButtons
        textTitle="Add Data Set"
        viewportScrolling
        withFooter={withFooter}>
      <StackGrid>
        <Typography>Search for a data set to assign permissions.</Typography>
        <SearchDataSetsForm onSubmit={handleOnSubmitDataSetQuery} searchRequestState={searchDataSetsRS} />
        {
          searchDataSetsRS !== RequestStates.STANDBY && (
            <PaginationToolbar
                count={searchTotalHits}
                onPageChange={handleOnPageChange}
                page={searchPage}
                rowsPerPage={MAX_PER_PAGE} />
          )
        }
        {
          searchDataSetsRS === RequestStates.PENDING && (
            <Spinner />
          )
        }
        {
          searchDataSetsRS === RequestStates.SUCCESS && !pageDataSets.isEmpty() && (
            <div>
              {
                pageDataSets.valueSeq().map((dataSet :EntitySet | Map) => {
                  const id :UUID = dataSet.id || getIn(dataSet, ['table', 'id']);
                  const title :UUID = dataSet.title || getIn(dataSet, ['table', 'title']);
                  return (
                    <GridCardSegment key={id} padding="8px 0">
                      <Typography>{title}</Typography>
                      <Radio name="select-data-set" value={id} />
                    </GridCardSegment>
                  );
                })
              }
            </div>
          )
        }
      </StackGrid>
    </Modal>
  );
};

export default DataSetPermissionsModal;
