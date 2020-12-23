/*
 * @flow
 */

import React, {
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';

import { List, Map, Set } from 'immutable';
import { PaginationToolbar, Typography } from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type {
  Ace,
  EntitySet,
  PermissionType,
  Principal,
  UUID,
} from 'lattice';
import type { RequestState } from 'redux-reqseq';

import DataSetPermissionsCard from './DataSetPermissionsCard';

import { Spinner, StackGrid } from '../../components';
import {
  GET_PAGE_DATA_SET_PERMISSIONS,
  INITIALIZE_DATA_SET_PERMISSIONS,
  getPageDataSetPermissions,
  initializeDataSetPermissions,
} from '../../core/permissions/actions';
import { PERMISSIONS } from '../../core/redux/constants';
import {
  selectAtlasDataSets,
  selectEntitySets,
  selectOrganizationAtlasDataSetIds,
  selectOrganizationEntitySetIds,
  selectPermissionsByPrincipal,
} from '../../core/redux/selectors';
import { getDataSetId, getDataSetTitle } from '../../utils';
import { INITIAL_PAGINATION_STATE, PAGE, paginationReducer } from '../../utils/stateReducers/pagination';
import type { DataSetPermissionTypeSelection } from '../../types';
import type { State as PaginationState } from '../../utils/stateReducers/pagination';

const MAX_PER_PAGE = 10;

const { reduceRequestStates } = ReduxUtils;

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

  const getPermissionsRS :?RequestState = useRequestState([PERMISSIONS, GET_PAGE_DATA_SET_PERMISSIONS]);
  const initializePermissionsRS :?RequestState = useRequestState([PERMISSIONS, INITIALIZE_DATA_SET_PERMISSIONS]);

  const atlasDataSetIds :Set<UUID> = useSelector(selectOrganizationAtlasDataSetIds(organizationId));
  const atlasDataSets :Map<UUID, Map> = useSelector(selectAtlasDataSets(atlasDataSetIds));
  const entitySetIds :Set<UUID> = useSelector(selectOrganizationEntitySetIds(organizationId));
  const entitySets :Map<UUID, EntitySet> = useSelector(selectEntitySets(entitySetIds));
  const atlasDataSetIdsHash :number = atlasDataSetIds.hashCode();
  const atlasDataSetsHash :number = atlasDataSets.hashCode();
  const entitySetIdsHash :number = entitySetIds.hashCode();
  const entitySetsHash :number = entitySets.hashCode();

  const keys :List<List<UUID>> = useMemo(() => (
    Set()
      .union(atlasDataSetIds)
      .union(entitySetIds)
      .map((id :UUID) => List([id]))
      .toList()
  ), [atlasDataSetIdsHash, entitySetIdsHash]);

  const permissions :Map<Principal, Map<List<UUID>, Ace>> = useSelector(selectPermissionsByPrincipal(keys));
  const permissionsHash :number = permissions.hashCode();

  const filteredPermissions :Map<List<UUID>, Ace> = useMemo(() => (
    (permissions.get(principal) || Map()).filter((ace :Ace, key :List<UUID>) => {
      const dataSetId :UUID = key.get(0);
      const atlasDataSet :?Map = atlasDataSets.get(dataSetId);
      const entitySet :?EntitySet = entitySets.get(dataSetId);
      const dataSetTitle :string = getDataSetTitle(atlasDataSet || entitySet);
      return (
        dataSetTitle.toLowerCase().includes(filterByQuery.toLowerCase())
        && filterByPermissionTypes.every((pt :PermissionType) => ace?.permissions.includes(pt))
      );
    })
  ), [
    atlasDataSetsHash,
    entitySetsHash,
    filterByPermissionTypes,
    filterByQuery,
    permissionsHash,
    principal,
  ]);

  const filteredPermissionsCount :number = filteredPermissions.count();
  const pagePermissions :Map<List<UUID>, Ace> = filteredPermissions.slice(start, start + MAX_PER_PAGE);
  const pageDataSetIds :Set<UUID> = pagePermissions.keySeq().flatten().toSet();
  const pageDataSetIdsHash :number = pageDataSetIds.hashCode();
  const pageAtlasDataSets :Map<UUID, Map> = useSelector(selectAtlasDataSets(pageDataSetIds));
  const pageEntitySets :Map<UUID, EntitySet> = useSelector(selectEntitySets(pageDataSetIds));
  const pageDataSets :Map<UUID, EntitySet | Map> = Map().merge(pageAtlasDataSets).merge(pageEntitySets);

  useEffect(() => {
    dispatch(initializeDataSetPermissions({ organizationId }));
  }, [dispatch, organizationId]);

  useEffect(() => {
    if (!pageDataSetIds.isEmpty()) {
      const pageAtlasDataSetIds = pageDataSetIds.filter((id :UUID) => atlasDataSetIds.has(id));
      const pageEntitySetIds = pageDataSetIds.filter((id :UUID) => entitySetIds.has(id));
      dispatch(
        getPageDataSetPermissions({
          atlasDataSetIds: pageAtlasDataSetIds,
          entitySetIds: pageEntitySetIds,
          organizationId,
          withProperties: true,
        })
      );
    }
  }, [
    atlasDataSetIdsHash,
    dispatch,
    entitySetIdsHash,
    organizationId,
    pageDataSetIdsHash,
  ]);

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

  const reducedRS :?RequestState = reduceRequestStates([getPermissionsRS, initializePermissionsRS]);

  return (
    <StackGrid gap={8}>
      {
        reducedRS === RequestStates.PENDING && (
          <Spinner />
        )
      }
      {
        reducedRS === RequestStates.SUCCESS && filteredPermissionsCount === 0 && (
          <Typography align="center">No datasets.</Typography>
        )
      }
      {
        reducedRS === RequestStates.SUCCESS && filteredPermissionsCount !== 0 && (
          pageDataSets.valueSeq().map((dataSet :EntitySet | Map) => {
            const dataSetId :UUID = getDataSetId(dataSet);
            return (
              <DataSetPermissionsCard
                  dataSet={dataSet}
                  isOpen={openDataSetId === dataSetId}
                  key={dataSetId}
                  onClick={toggleOpenDataSetCard}
                  onSelect={onSelect}
                  principal={principal}
                  selection={selection} />
            );
          })
        )
      }
      {
        filteredPermissionsCount > MAX_PER_PAGE && (
          <PaginationToolbar
              count={filteredPermissionsCount}
              onPageChange={handleOnPageChange}
              page={page}
              rowsPerPage={MAX_PER_PAGE} />
        )
      }
    </StackGrid>
  );
};

export default DataSetPermissionsContainer;
