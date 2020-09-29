/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';
import { List, Map, Set } from 'immutable';
import { PaginationToolbar, Spinner } from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
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

import { StackGrid } from '../../../components';
import { GET_OR_SELECT_DATA_SETS, getOrSelectDataSets } from '../../../core/edm/actions';
import {
  GET_ENTITY_SET_PERMISSIONS,
  GET_PROPERTY_TYPE_PERMISSIONS,
  getPropertyTypePermissions,
} from '../../../core/permissions/actions';
import { EDM, PERMISSIONS } from '../../../core/redux/constants';
import { selectOrganizationEntitySetIds, selectPermissions } from '../../../core/redux/utils';
import type { PermissionSelection } from '../../../types';

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
  const [paginationIndex, setPaginationIndex] = useState(0);
  const [paginationPage, setPaginationPage] = useState(0);

  const getEntitySetPermissionsRS :?RequestState = useRequestState([PERMISSIONS, GET_ENTITY_SET_PERMISSIONS]);
  const getPropertyTypePermissionsRS :?RequestState = useRequestState([PERMISSIONS, GET_PROPERTY_TYPE_PERMISSIONS]);
  const getOrSelectDataSetsRS :?RequestState = useRequestState([EDM, GET_OR_SELECT_DATA_SETS]);

  const entitySetIds :Set<UUID> = useSelector(selectOrganizationEntitySetIds(organizationId));
  const keys :List<List<UUID>> = useMemo(() => (
    entitySetIds.map((id) => List([id]))
  ), [entitySetIds]);

  const permissions :Map<List<UUID>, Ace> = useSelector(selectPermissions(keys, principal));
  const permissionsCount :number = permissions.count();
  const pagePermissions :Map<List<UUID>, Ace> = permissions.slice(paginationIndex, paginationIndex + MAX_PER_PAGE);
  const pageDataSetIds :List<UUID> = pagePermissions.keySeq().flatten().toSet();
  const pageDataSetIdsHash :number = pageDataSetIds.hashCode();
  const pageDataSets :Map<UUID, EntitySet> = useSelector(selectEntitySets(pageDataSetIds));
  const pageDataSetsHash :number = pageDataSets.hashCode();

  useEffect(() => {
    if (!pageDataSetIds.isEmpty()) {
      dispatch(getOrSelectDataSets(pageDataSetIds));
    }
  }, [dispatch, pageDataSetIdsHash]);

  useEffect(() => {
    if (!pageDataSets.isEmpty()) {
      dispatch(getPropertyTypePermissions(pageDataSetIds));
    }
  }, [dispatch, pageDataSetsHash]);

  // NOTE: initializeOrganization() makes a non-blocking call to getEntitySetPermissions()
  if (getEntitySetPermissionsRS === RequestStates.PENDING) {
    return (
      <SpinnerWrapper>
        <Spinner size="2x" />
      </SpinnerWrapper>
    );
  }

  const reducedRS = reduceRequestStates([getPropertyTypePermissionsRS, getOrSelectDataSetsRS]);

  const handleOnPageChange = ({ page, start }) => {
    setPaginationIndex(start);
    setPaginationPage(page);
    onSelect();
  };

  return (
    <StackGrid>
      {
        permissionsCount > MAX_PER_PAGE && (
          <PaginationToolbar
              count={permissionsCount}
              onPageChange={handleOnPageChange}
              page={paginationPage}
              rowsPerPage={MAX_PER_PAGE} />
        )
      }
      {
        reducedRS === RequestStates.PENDING && (
          <SpinnerWrapper>
            <Spinner size="2x" />
          </SpinnerWrapper>
        )
      }
      {
        reducedRS === RequestStates.SUCCESS && (
          pageDataSets.valueSeq().map((dataSet :EntitySet) => (
            <DataSetPermissionsCard
                dataSet={dataSet}
                key={dataSet.id}
                onSelect={onSelect}
                principal={principal}
                selection={selection} />
          ))
        )
      }
    </StackGrid>
  );
};

export default DataSetPermissionsContainer;
