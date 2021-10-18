/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import { List, Map, get } from 'immutable';
import { AppContentWrapper, Typography } from 'lattice-ui-kit';
import {
  ReduxUtils,
  RoutingUtils,
  useRequestState
} from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router';
import type { Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { GET_DATA_SETS_IN_COLLABORATION, clearCollaborationDataSets, getDataSetsInCollaboration } from './actions';
import {
  AddDataSetToCollaborationModal,
  AddOrganizationsToCollaborationModal,
  DataSetListCard,
  RemoveDataSetFromCollaborationModal
} from './components';

import {
  COLLABORATIONS,
  DESCRIPTION,
  ID,
  TITLE
} from '../../common/constants';
import {
  BasicErrorComponent,
  GapGrid,
  PlusButton,
  SpaceBetweenGrid,
  Spinner,
  StackGrid
} from '../../components';
import { resetRequestStates } from '../../core/redux/actions';
import {
  selectCollaboration,
  selectCollaborationDataSets,
  selectOrganizations,
  selectOrgsDataSets
} from '../../core/redux/selectors';
import { Routes } from '../../core/router';

const {
  isFailure,
  isPending,
  isStandby,
} = ReduxUtils;

const { getParamFromMatch } = RoutingUtils;

const CollaborationsContainer = () => {
  const dispatch = useDispatch();
  const matchCollaboration = useRouteMatch(Routes.COLLABORATION);
  const collaborationId = getParamFromMatch(matchCollaboration, Routes.COLLABORATION_ID_PARAM) || '';

  useEffect(() => {
    dispatch(getDataSetsInCollaboration(collaborationId));
    return () => {
      dispatch(resetRequestStates([GET_DATA_SETS_IN_COLLABORATION]));
      dispatch(clearCollaborationDataSets());
    };
  }, [dispatch, collaborationId]);

  const [isVisibleAddDataSetModal, setIsVisibleAddDataSetModal] = useState(false);
  const [isVisibleAddOrganizationModal, setIsVisibleAddOrganizationModal] = useState(false);

  const [dataSetToRemove, setDataSetToRemove] = useState(null);

  const collaboration :Map<UUID, List<UUID>> = useSelector(selectCollaboration(collaborationId));
  const collaborationDataSetMap :Map<UUID, List<UUID>> = useSelector(selectCollaborationDataSets(collaborationId));
  const organizations :Map<UUID, Organization> = useSelector(selectOrganizations());
  const collaborationTitle :string = collaboration.get(TITLE, '');
  const collaborationDescription :string = collaboration.get(DESCRIPTION, '');

  const collaborationDataSetIds :List<UUID> = collaborationDataSetMap.valueSeq().flatten();
  const collaborationDataSets :Map<UUID, Map<UUID, Map>> = useSelector(selectOrgsDataSets(collaborationDataSetMap));

  const getDataSetsInCollaborationRS :?RequestState = useRequestState([COLLABORATIONS, GET_DATA_SETS_IN_COLLABORATION]);

  if (isStandby(getDataSetsInCollaborationRS) || isPending(getDataSetsInCollaborationRS)) {
    return (
      <AppContentWrapper>
        <Spinner />
      </AppContentWrapper>
    );
  }

  if (isFailure(getDataSetsInCollaborationRS)) {
    return (
      <AppContentWrapper>
        <BasicErrorComponent>
          Failed to load collaboration data sets. Please try again or contact support.
        </BasicErrorComponent>
      </AppContentWrapper>
    );
  }

  const closeRemoveDatSetModal = () => setDataSetToRemove(null);

  return (
    <AppContentWrapper>
      <StackGrid gap={32}>
        <StackGrid>
          <SpaceBetweenGrid>
            <div>
              <Typography variant="h1">{collaborationTitle}</Typography>
            </div>
            <GapGrid gap={10}>
              <PlusButton
                  aria-label="add data set"
                  color="default"
                  onClick={() => setIsVisibleAddDataSetModal(true)}>
                <Typography component="span">Add Data Set</Typography>
              </PlusButton>
              <PlusButton
                  aria-label="add organization"
                  color="default"
                  onClick={() => setIsVisibleAddOrganizationModal(true)}>
                <Typography component="span">Add Organization</Typography>
              </PlusButton>
            </GapGrid>
          </SpaceBetweenGrid>
          <Typography>{collaborationDescription}</Typography>
        </StackGrid>
        <StackGrid gap={32}>
          {
            collaborationDataSets.entrySeq().map(([organizationId, dataSets]) => {
              const organization = get(organizations, organizationId, Map());
              return (
                <StackGrid key={organizationId} gap={8}>
                  <Typography variant="h5">{organization.title}</Typography>
                  {
                    dataSets.valueSeq().map((dataSet) => (
                      <DataSetListCard key={dataSet.get(ID)} dataSet={dataSet} removeDataSet={setDataSetToRemove} />
                    ))
                  }
                </StackGrid>
              );
            })
          }
        </StackGrid>
        <StackGrid />
      </StackGrid>
      <AddDataSetToCollaborationModal
          collaborationId={collaborationId}
          existingDataSets={collaborationDataSetIds}
          isVisible={isVisibleAddDataSetModal}
          onClose={() => setIsVisibleAddDataSetModal(false)} />
      <AddOrganizationsToCollaborationModal
          collaborationId={collaborationId}
          isVisible={isVisibleAddOrganizationModal}
          onClose={() => setIsVisibleAddOrganizationModal(false)} />
      <RemoveDataSetFromCollaborationModal
          collaborationId={collaborationId}
          dataSet={dataSetToRemove}
          isVisible={!!dataSetToRemove}
          onClose={closeRemoveDatSetModal} />
    </AppContentWrapper>
  );
};

export default CollaborationsContainer;
