/*
 * @flow
 */

import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';

import { List, Map } from 'immutable';
import { PaginationToolbar, Typography } from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type {
  Ace,
  EntitySetFlagType,
  PermissionType,
  Principal,
  UUID,
} from 'lattice';
import type { RequestState } from 'redux-reqseq';

import DataSetPermissionsCard from './DataSetPermissionsCard';

import { Spinner, StackGrid } from '../../components';
import { GET_ORG_DATA_SETS_FROM_META, GET_ORG_DATA_SET_COLUMNS_FROM_META } from '../../core/edm/actions';
import {
  ASSIGN_PERMISSIONS_TO_DATA_SET,
  GET_DATA_SET_PERMISSIONS_PAGE,
  SET_PERMISSIONS,
  getDataSetPermissionsPage,
} from '../../core/permissions/actions';
import { resetRequestStates } from '../../core/redux/actions';
import {
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
} = ReduxUtils;

const DataSetPermissionsContainer = ({
  filterByEntitySetFlagType,
  filterByPermissionTypes,
  filterByQuery,
  onSelect,
  organizationId,
  principal,
  selection,
} :{|
  filterByEntitySetFlagType :?EntitySetFlagType;
  filterByPermissionTypes :Array<PermissionType>;
  filterByQuery :string;
  onSelect :(selection :?DataSetPermissionTypeSelection) => void;
  organizationId :UUID;
  principal :Principal;
  selection :?DataSetPermissionTypeSelection;
|}) => {

  const dispatch = useDispatch();

  const shouldInitialize = useRef(true);
  const [openDataSetId, setOpenDataSetId] = useState('');
  const [paginationState, paginationDispatch] = useReducer(paginationReducer, INITIAL_PAGINATION_STATE);
  const { page, start } = paginationState;

  const assignPermissionsToDataSetRS :?RequestState = useRequestState([PERMISSIONS, ASSIGN_PERMISSIONS_TO_DATA_SET]);
  const getDataSetPermissionsPageRS :?RequestState = useRequestState([PERMISSIONS, GET_DATA_SET_PERMISSIONS_PAGE]);
  const setPermissionsRS :?RequestState = useRequestState([PERMISSIONS, SET_PERMISSIONS]);

  const dataSetPermissionsPage :Map = useSelector(selectDataSetPermissionsPage());
  const totalPermissions :number = dataSetPermissionsPage.get(TOTAL_PERMISSIONS) || 0;
  const pagePermissionsByDataSet :Map<UUID, Map<List<UUID>, Ace>> = (
    dataSetPermissionsPage.get(PAGE_PERMISSIONS_BY_DATA_SET) || Map()
  );

  useEffect(() => () => {
    dispatch(
      resetRequestStates([
        GET_DATA_SET_PERMISSIONS_PAGE,
        GET_ORG_DATA_SETS_FROM_META,
        GET_ORG_DATA_SET_COLUMNS_FROM_META,
      ])
    );
  }, [dispatch]);

  useEffect(() => {
    if (shouldInitialize.current === true && isSuccess(getDataSetPermissionsPageRS)) {
      shouldInitialize.current = false;
    }
  }, [getDataSetPermissionsPageRS]);

  const dispatchGetDataSetPermissionsPage = useCallback(() => {
    dispatch(
      getDataSetPermissionsPage({
        filterByEntitySetFlagType,
        filterByPermissionTypes,
        filterByQuery,
        initialize: shouldInitialize.current,
        organizationId,
        pageSize: MAX_PER_PAGE,
        principal,
        start,
      })
    );
  }, [
    dispatch,
    filterByEntitySetFlagType,
    filterByPermissionTypes,
    filterByQuery,
    organizationId,
    principal,
    start,
  ]);

  useEffect(() => {
    dispatchGetDataSetPermissionsPage();
  }, [dispatchGetDataSetPermissionsPage]);

  useEffect(() => {
    // NOTE: refresh when permissions are assigned via AssignPermissionsToDataSetModal
    if (isSuccess(assignPermissionsToDataSetRS)) {
      dispatchGetDataSetPermissionsPage();
    }
  }, [assignPermissionsToDataSetRS, dispatchGetDataSetPermissionsPage]);

  useEffect(() => {
    // NOTE: refresh when permissions are changed via PermissionsPanel
    if (isSuccess(setPermissionsRS)) {
      dispatchGetDataSetPermissionsPage();
    }
  }, [dispatchGetDataSetPermissionsPage, setPermissionsRS]);

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

  return (
    <StackGrid gap={8}>
      {
        isPending(getDataSetPermissionsPageRS) && (
          <Spinner />
        )
      }
      {
        isSuccess(getDataSetPermissionsPageRS) && totalPermissions === 0 && (
          <Typography align="center">No datasets.</Typography>
        )
      }
      {
        isSuccess(getDataSetPermissionsPageRS) && totalPermissions !== 0 && (
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
