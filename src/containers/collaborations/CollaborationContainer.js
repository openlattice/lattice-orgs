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

  const collaborationOrganizationIds :List<UUID> = collaboration.get('organizationIds', List());
  const collaborationTitle :string = collaboration.get('title', '');
  const collaborationDescription :string = collaboration.get('description', '');

  const collaborationDataSetIds :List<UUID> = collaborationDataSetMap.valueSeq().flatten();
  const collaborationDataSets :Map<UUID, Map<UUID, Map>> = useSelector(selectOrgsDataSets(collaborationDataSetMap));

  const closeRemoveDatSetModal = () => setDataSetToRemove(null);

  return (
    <AppContentWrapper>
      <StackGrid gap={32}>
        <StackGrid>
          <SpaceBetweenGrid>
            <GapGrid>
              <Typography variant="h1">{collaborationTitle}</Typography>
            </GapGrid>
            <GapGrid gap={10}>
              <PlusButton
                  aria-label="add dataset"
                  color="default"
                  onClick={() => setIsVisibleAddDataSetModal(true)}>
                <Typography component="span">Add DataSet</Typography>
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
                <StackGrid gap={8}>
                  <Typography variant="h5">{organization.title}</Typography>
                  {
                    dataSets.valueSeq().map((dataSet) => (
                      <DataSetListCard dataSet={dataSet} removeDataSet={setDataSetToRemove} />
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
          onClose={() => setIsVisibleAddDataSetModal(false)}
          organizationIds={collaborationOrganizationIds} />
      <AddOrganizationsToCollaborationModal
          collaborationId={collaborationId}
          isVisible={isVisibleAddOrganizationModal}
          onClose={() => setIsVisibleAddOrganizationModal(false)}
          participatingOrganizations={collaborationOrganizationIds} />
      <RemoveDataSetFromCollaborationModal
          collaborationId={collaborationId}
          dataSet={dataSetToRemove}
          isVisible={!!dataSetToRemove}
          onClose={closeRemoveDatSetModal} />
    </AppContentWrapper>
  );
};

export default CollaborationsContainer;
