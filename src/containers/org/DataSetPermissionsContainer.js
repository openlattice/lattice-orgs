/*
 * @flow
 */

import React, { useEffect, useReducer, useState } from 'react';

import styled from 'styled-components';
import {
  List,
  Map,
  Set,
  getIn,
} from 'immutable';
import {
  Modal,
  PaginationToolbar,
  Spinner,
  Typography,
} from 'lattice-ui-kit';
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
import { AssignPermissionsToDataSet } from './components';

import {
  ActionsGrid,
  PlusButton,
  SearchForm,
  StackGrid,
  StepsController,
} from '../../components';
import {
  GET_DATA_SET_PERMISSIONS,
  GET_PAGE_DATA_SET_PERMISSIONS,
  getPageDataSetPermissions,
} from '../../core/permissions/actions';
import {
  ATLAS_DATA_SET_IDS,
  ENTITY_SET_IDS,
  PERMISSIONS,
  SEARCH,
} from '../../core/redux/constants';
import {
  selectAtlasDataSets,
  selectOrganizationAtlasDataSetIds,
  selectOrganizationEntitySetIds,
  selectPermissions,
  selectSearchHits,
} from '../../core/redux/selectors';
import {
  SEARCH_DATA_SETS_TO_FILTER as SEARCH_DATA_SETS,
  clearSearchState,
  searchDataSetsToFilter as searchDataSets,
} from '../../core/search/actions';
import {
  FILTER,
  INITIAL_PAGINATION_STATE,
  PAGE,
  paginationReducer,
} from '../../utils/stateReducers/pagination';
import type { PermissionSelection } from '../../types';

const { isNonEmptyString } = LangUtils;
const { reduceRequestStates, selectEntitySets } = ReduxUtils;

const MAX_PER_PAGE = 10;

const SpinnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const noop = () => {};

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
  const [isVisibleAddDataSetModal, setIsVisibleAddDataSetModal] = useState(false);
  const [keys, setKeys] = useState(List());
  const [paginationState, paginationDispatch] = useReducer(paginationReducer, INITIAL_PAGINATION_STATE);

  const getDataSetPermissionsRS :?RequestState = useRequestState([PERMISSIONS, GET_DATA_SET_PERMISSIONS]);
  const getPageDataSetPermissionsRS :?RequestState = useRequestState([PERMISSIONS, GET_PAGE_DATA_SET_PERMISSIONS]);
  const searchDataSetsRS :?RequestState = useRequestState([SEARCH, SEARCH_DATA_SETS]);

  const atlasDataSetIds :Set<UUID> = useSelector(selectOrganizationAtlasDataSetIds(organizationId));
  const atlasDataSetIdsHash :number = atlasDataSetIds.hashCode();
  const entitySetIds :Set<UUID> = useSelector(selectOrganizationEntitySetIds(organizationId));
  const entitySetIdsHash :number = entitySetIds.hashCode();
  const searchHits :Map = useSelector(selectSearchHits(SEARCH_DATA_SETS));
  const searchHitsHash :number = searchHits.hashCode();

  const permissions :Map<List<UUID>, Ace> = useSelector(selectPermissions(keys, principal));
  const permissionsCount :number = permissions.count();
  const pagePermissions :Map<List<UUID>, Ace> = permissions
    .slice(paginationState.start, paginationState.start + MAX_PER_PAGE);
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
        .filter((id :UUID) => searchHits.hasIn([ATLAS_DATA_SET_IDS, id]) || searchHits.hasIn([ENTITY_SET_IDS, id]))
        .map((id :UUID) => List([id]))
        .toList();
      if (!keys.equals(newKeys)) {
        setKeys(newKeys);
      }
    }
  }, [
    atlasDataSetIdsHash,
    entitySetIdsHash,
    keys,
    searchDataSetsRS,
    searchHitsHash,
  ]);

  useEffect(() => {
    if (!pageDataSetIds.isEmpty()) {
      const pageAtlasDataSetIds = pageDataSetIds.filter((id :UUID) => atlasDataSetIds.has(id));
      const pageEntitySetIds = pageDataSetIds.filter((id :UUID) => entitySetIds.has(id));
      dispatch(
        getPageDataSetPermissions({
          organizationId,
          atlasDataSetIds: pageAtlasDataSetIds,
          entitySetIds: pageEntitySetIds,
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

  useEffect(() => () => {
    dispatch(clearSearchState(SEARCH_DATA_SETS));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dispatchDataSetSearch = (query :?string) => {
    if (isNonEmptyString(query)) {
      dispatch(
        searchDataSets({
          organizationId,
          query,
          all: true,
        })
      );
    }
    else {
      dispatch(clearSearchState(SEARCH_DATA_SETS));
    }
  };

  const handleOnPageChange = ({ page, start }) => {
    paginationDispatch({ type: PAGE, page, start });
    onSelect();
  };

  const handleOnSubmitDataSetQuery = (query :string) => {
    paginationDispatch({ type: FILTER, query });
    onSelect();
    dispatchDataSetSearch(query);
  };

  const reducedRS :?RequestState = reduceRequestStates([
    getDataSetPermissionsRS,
    getPageDataSetPermissionsRS,
    searchDataSetsRS,
  ]);

  return (
    <>
      <StackGrid>
        <ActionsGrid>
          <SearchForm onSubmit={handleOnSubmitDataSetQuery} searchRequestState={searchDataSetsRS} />
          <PlusButton aria-label="add data set" onClick={() => setIsVisibleAddDataSetModal(true)}>
            <Typography component="span">Add Data Set</Typography>
          </PlusButton>
        </ActionsGrid>
        {
          <PaginationToolbar
              count={permissionsCount}
              onPageChange={handleOnPageChange}
              page={paginationState.page}
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
      <Modal
          isVisible={isVisibleAddDataSetModal}
          onClose={noop}
          shouldCloseOnOutsideClick={false}
          viewportScrolling
          withFooter={false}
          withHeader={false}>
        <StepsController>
          {
            ({ step, stepBack, stepNext }) => (
              <AssignPermissionsToDataSet
                  onClose={() => setIsVisibleAddDataSetModal(false)}
                  organizationId={organizationId}
                  principal={principal}
                  step={step}
                  stepBack={stepBack}
                  stepNext={stepNext} />
            )
          }
        </StepsController>
      </Modal>
    </>
  );
};

export default DataSetPermissionsContainer;
