/*
 * @flow
 */

import React, { useState } from 'react';

import { List, Map, get } from 'immutable';
import { AppContentWrapper, Typography } from 'lattice-ui-kit';
import { useSelector } from 'react-redux';
import type { Organization, UUID } from 'lattice';

import {
  AddDataSetToCollaborationModal,
  AddOrganizationsToCollaborationModal,
  DataSetListCard,
  RemoveDataSetFromCollaborationModal
} from './components';

import { DESCRIPTION, ID, TITLE } from '../../common/constants';
import {
  GapGrid,
  PlusButton,
  SpaceBetweenGrid,
  StackGrid
} from '../../components';
import {
  selectCollaboration,
  selectCollaborationDataSets,
  selectOrganizations,
  selectOrgsDataSets
} from '../../core/redux/selectors';

const CollaborationsContainer = ({
  collaborationId,
} :{|
  collaborationId :UUID;
|}) => {
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
