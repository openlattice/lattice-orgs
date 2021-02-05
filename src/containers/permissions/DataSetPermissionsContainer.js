/*
 * @flow
 */

import React, { useEffect, useReducer, useState } from 'react';

import { List, Map } from 'immutable';
import { PaginationToolbar, Typography } from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type {
  Ace,
  PermissionType,
  Principal,
  UUID,
} from 'lattice';
import type { RequestState } from 'redux-reqseq';

import DataSetPermissionsCard from './DataSetPermissionsCard';

import { Spinner, StackGrid } from '../../components';
import { GET_ORG_DATA_SETS_FROM_META, getOrgDataSetsFromMeta } from '../../core/edm/actions';
import { GET_DATA_SET_PERMISSIONS_PAGE, getDataSetPermissionsPage } from '../../core/permissions/actions';
import {
  EDM,
  PAGE_PERMISSIONS_BY_DATA_SET,
  PERMISSIONS,
  TOTAL_PERMISSIONS,
} from '../../core/redux/constants';
import { selectDataSetPermissionsPage } from '../../core/redux/selectors';
import {
  INITIAL_PAGINATION_STATE,
  PAGE,
  RESET,
  paginationReducer,
} from '../../utils/stateReducers/pagination';
import type { DataSetPermissionTypeSelection } from '../../types';
import type { State as PaginationState } from '../../utils/stateReducers/pagination';

const MAX_PER_PAGE = 10;

const {
  isPending,
  isSuccess,
  reduceRequestStates,
} = ReduxUtils;

const DataSetPermissionsContainer = ({
  filterByPermissionTypes,
  filterByQuery,
  onSelect,
  organizationId,
  principal,
  selection,
} :{|
  filterByPermissionTypes :Array<PermissionType>;
  filterByQuery :string;
  onSelect :(selection :?DataSetPermissionTypeSelection) => void;
  organizationId :UUID;
  principal :Principal;
  selection :?DataSetPermissionTypeSelection;
|}) => {

  const dispatch = useDispatch();

  const [openDataSetId, setOpenDataSetId] = useState('');
  const [paginationState, paginationDispatch] = useReducer(paginationReducer, INITIAL_PAGINATION_STATE);
  const { page, start } = paginationState;

  const getOrgDataSetsFromMetaRS :?RequestState = useRequestState([EDM, GET_ORG_DATA_SETS_FROM_META]);
  const getPrincipalPermissionsPageRS :?RequestState = useRequestState([PERMISSIONS, GET_DATA_SET_PERMISSIONS_PAGE]);

  const dataSetPermissionsPage :Map = useSelector(selectDataSetPermissionsPage());
  const totalPermissions :number = dataSetPermissionsPage.get(TOTAL_PERMISSIONS) || 0;
  const pagePermissionsByDataSet :Map<UUID, Map<List<UUID>, Ace>> = (
    dataSetPermissionsPage.get(PAGE_PERMISSIONS_BY_DATA_SET) || Map()
  );

  useEffect(() => {
    dispatch(getOrgDataSetsFromMeta({ organizationId }));
  }, [dispatch, organizationId]);

  useEffect(() => {
    if (isSuccess(getOrgDataSetsFromMetaRS)) {
      dispatch(
        getDataSetPermissionsPage({
          filterByPermissionTypes,
          filterByQuery,
          organizationId,
          pageSize: MAX_PER_PAGE,
          principal,
          start,
        })
      );
    }
  }, [
    dispatch,
    filterByPermissionTypes,
    filterByQuery,
    getOrgDataSetsFromMetaRS,
    organizationId,
    principal,
    start,
  ]);

  useEffect(() => {
    paginationDispatch({ type: RESET });
  }, [filterByPermissionTypes, filterByQuery]);

  const handleOnPageChange = (state :PaginationState) => {
    paginationDispatch({
      page: state.page,
      start: state.start,
      type: PAGE,
    });
    onSelect();
  };

  const toggleOpenDataSetCard = (dataSetId :UUID) => {
    if (openDataSetId === dataSetId) {
      setOpenDataSetId('');
    }
    else {
      setOpenDataSetId(dataSetId);
    }
  };

  const reducedRequestState :?RequestState = reduceRequestStates([
    getOrgDataSetsFromMetaRS,
    getPrincipalPermissionsPageRS,
  ]);

  return (
    <StackGrid gap={8}>
      {
        isPending(reducedRequestState) && (
          <Spinner />
        )
      }
      {
        isSuccess(reducedRequestState) && totalPermissions === 0 && (
          <Typography align="center">No datasets.</Typography>
        )
      }
      {
        isSuccess(reducedRequestState) && totalPermissions !== 0 && (
          pagePermissionsByDataSet.map((permissions :Map<List<UUID>, Ace>, dataSetId :UUID) => (
            <DataSetPermissionsCard
                dataSetId={dataSetId}
                dataSetPermissions={permissions}
                isOpen={openDataSetId === dataSetId}
                key={dataSetId} // eslint-disable-line react/no-array-index-key
                onClick={toggleOpenDataSetCard}
                onSelect={onSelect}
                organizationId={organizationId}
                selection={selection} />
          )).valueSeq()
        )
      }
      {
        totalPermissions > MAX_PER_PAGE && (
          <PaginationToolbar
              count={totalPermissions}
              onPageChange={handleOnPageChange}
              page={page}
              rowsPerPage={MAX_PER_PAGE} />
        )
      }
    </StackGrid>
  );
};

export default DataSetPermissionsContainer;
