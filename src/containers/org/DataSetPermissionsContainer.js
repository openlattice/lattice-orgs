/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import {
  List,
  Map,
  Set,
  getIn,
} from 'immutable';
import { PaginationToolbar, Spinner } from 'lattice-ui-kit';
import { LangUtils, ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type {
  Ace,
  EntitySet,
  Principal,
  UUID,
} from 'lattice';
import type { RequestState } from 'redux-reqseq';

import DataSetPermissionsCard from './DataSetPermissionsCard';
import { SearchDataSetsForm } from './components';

import { StackGrid } from '../../components';
import { GET_DATA_SET_PERMISSIONS, getDataSetPermissions } from '../../core/permissions/actions';
import { PERMISSIONS, SEARCH } from '../../core/redux/constants';
import {
  selectAtlasDataSets,
  selectDataSetSearchHits,
  selectOrganizationAtlasDataSetIds,
  selectOrganizationEntitySetIds,
  selectPermissions,
} from '../../core/redux/selectors';
import { SEARCH_DATA_SETS, clearSearchState, searchDataSets } from '../../core/search/actions';
import type { PermissionSelection } from '../../types';

const { isNonEmptyString } = LangUtils;
const { reduceRequestStates, selectEntitySets } = ReduxUtils;

const MAX_PER_PAGE = 10;

const SpinnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const DataSetPermissionsContainer = ({
  onSelect,
  organizationId,
  principal,
  selection,
} :{|
  onSelect :(selection :?PermissionSelection) => void;
  organizationId :UUID;
  principal :Principal;
  selection :?PermissionSelection;
|}) => {

  const dispatch = useDispatch();
  const [keys, setKeys] = useState(List());
  const [paginationIndex, setPaginationIndex] = useState(0);
  const [paginationPage, setPaginationPage] = useState(0);

  const getDataSetPermissionsRS :?RequestState = useRequestState([PERMISSIONS, GET_DATA_SET_PERMISSIONS]);
  const searchDataSetsRS :?RequestState = useRequestState([SEARCH, SEARCH_DATA_SETS]);

  const atlasDataSetIds :Set<UUID> = useSelector(selectOrganizationAtlasDataSetIds(organizationId));
  const atlasDataSetIdsHash :number = atlasDataSetIds.hashCode();
  const entitySetIds :Set<UUID> = useSelector(selectOrganizationEntitySetIds(organizationId));
  const entitySetIdsHash :number = entitySetIds.hashCode();
  const searchHits :Set<UUID> = useSelector(selectDataSetSearchHits());
  const searchHitsHash :number = searchHits.hashCode();

  const permissions :Map<List<UUID>, Ace> = useSelector(selectPermissions(keys, principal));
  const permissionsCount :number = permissions.count();
  const pagePermissions :Map<List<UUID>, Ace> = permissions.slice(paginationIndex, paginationIndex + MAX_PER_PAGE);
  const pageDataSetIds :List<UUID> = pagePermissions.keySeq().flatten().toSet();
  const pageDataSetIdsHash :number = pageDataSetIds.hashCode();
  const pageAtlasDataSets :Map<UUID, Map> = useSelector(selectAtlasDataSets(pageDataSetIds));
  const pageEntitySets :Map<UUID, EntitySet> = useSelector(selectEntitySets(pageDataSetIds));
  const pageDataSets :Map<UUID, EntitySet | Map> = Map().merge(pageAtlasDataSets).merge(pageEntitySets);

  useEffect(() => {
    if (searchDataSetsRS === RequestStates.STANDBY) {
      const newKeys :List<List<UUID>> = Set()
        .union(atlasDataSetIds)
        .union(entitySetIds)
        .map((id :UUID) => List([id]))
        .toList();
      if (!keys.equals(newKeys)) {
        setKeys(newKeys);
      }
    }
    else if (searchDataSetsRS === RequestStates.SUCCESS) {
      const newKeys :List<List<UUID>> = Set()
        .union(atlasDataSetIds)
        .union(entitySetIds)
        .filter((id :UUID) => searchHits.has(id))
        .map((id :UUID) => List([id]))
        .toList();
      if (!keys.equals(newKeys)) {
        setKeys(newKeys);
      }
    }
  }, [atlasDataSetIdsHash, entitySetIdsHash, keys, searchHitsHash, searchDataSetsRS]);

  useEffect(() => {
    if (!pageDataSetIds.isEmpty()) {
      const pageAtlasDataSetIds = pageDataSetIds.filter((id :UUID) => atlasDataSetIds.has(id));
      const pageEntitySetIds = pageDataSetIds.filter((id :UUID) => entitySetIds.has(id));
      dispatch(
        getDataSetPermissions({
          organizationId,
          atlasDataSetIds: pageAtlasDataSetIds,
          entitySetIds: pageEntitySetIds,
          withProperties: true,
        })
      );
    }
  }, [dispatch, atlasDataSetIdsHash, entitySetIdsHash, pageDataSetIdsHash, organizationId]);

  useEffect(() => () => {
    dispatch(clearSearchState(SEARCH_DATA_SETS));
  }, []);

  const dispatchDataSetSearch = (query :?string) => {

    if (query === '') {
      dispatch(clearSearchState(SEARCH_DATA_SETS));
    }

    if (isNonEmptyString(query)) {
      const ids = Set().union(atlasDataSetIds).union(entitySetIds);
      dispatch(
        searchDataSets({
          query,
          maxHits: ids.count(),
        })
      );
    }
  };

  const handleOnPageChange = ({ page, start }) => {
    setPaginationIndex(start);
    setPaginationPage(page);
    onSelect();
  };

  const handleOnSubmitDataSetQuery = (query :string) => {
    setPaginationIndex(0);
    setPaginationPage(0);
    onSelect();
    dispatchDataSetSearch(query);
  };

  const reducedRS :?RequestState = reduceRequestStates([getDataSetPermissionsRS, searchDataSetsRS]);

  return (
    <StackGrid>
      <SearchDataSetsForm onSubmit={handleOnSubmitDataSetQuery} searchRequestState={searchDataSetsRS} />
      {
        <PaginationToolbar
            count={permissionsCount}
            onPageChange={handleOnPageChange}
            page={paginationPage}
            rowsPerPage={MAX_PER_PAGE} />
      }
      {
        reducedRS === RequestStates.PENDING && (
          <SpinnerWrapper>
            <Spinner size="2x" />
          </SpinnerWrapper>
        )
      }
      {
        reducedRS !== RequestStates.PENDING && (
          pageDataSets.valueSeq().map((dataSet :EntitySet | Map) => {
            const dataSetId :UUID = dataSet.id || getIn(dataSet, ['table', 'id']);
            return (
              <DataSetPermissionsCard
                  dataSet={dataSet}
                  key={dataSetId}
                  onSelect={onSelect}
                  principal={principal}
                  selection={selection} />
            );
          })
        )
      }
    </StackGrid>
  );
};

export default DataSetPermissionsContainer;
