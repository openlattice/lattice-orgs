/*
 * @flow
 */

import React, { useMemo, useState } from 'react';

import styled from 'styled-components';
import {
  Map, List, Set, get
} from 'immutable';
import {
  Checkbox,
  Colors,
  SearchInput,
  Typography,
} from 'lattice-ui-kit';
import { CollaborationsApiActions } from 'lattice-sagas';
import { ValidationUtils } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { Organization, UUID } from 'lattice';

import {
  ActionsGrid,
  DataSetTitle,
  Expansion,
  LinkButton,
  PlusButton,
  StackGrid,
} from '../../components';
import {
  selectCollaboration,
  selectCollaborationDataSets,
  selectOrganizations,
  selectOrgsDataSets
} from '../../core/redux/selectors';

const { NEUTRAL } = Colors;
const { isValidUUID } = ValidationUtils;
const { addDataSetToCollaboration } = CollaborationsApiActions;

const StyledCheckbox = styled(Checkbox)`
  label > span > span > span {
    align-items: flex-start;
    text-align: left;
  }
`;

const CollaborationWrapper = styled.div`
  display: grid;
  grid-template-columns: minmax(380px, 30%) minmax(1056px, 70%);
  position: relative;
  width: 100%;
  height: 100%;

  > :first-child {
    border-right: 1px solid ${NEUTRAL.N300};
  }
`;

const SubWrapper = styled.div`
  width: 100%;
  padding: 40px 50px;
`;

const CollaborationsContainer = ({
  collaborationId,
} :{|
  collaborationId :UUID;
|}) => {
  const [filteredOrganizations, setFilteredOrganizations] = useState(Set());
  const [selectedDataSets, setSelectedDataSets] = useState(Set());
  const collaboration :Map<UUID, List<UUID>> = useSelector(selectCollaboration(collaborationId));
  const collaborationDataSetMap :Map<UUID, List<UUID>> = useSelector(selectCollaborationDataSets(collaborationId));
  const organizations :Map<UUID, Organization> = useSelector(selectOrganizations());

  const collaborationOrganizationIds :List<UUID> = collaboration.get('organizationIds', List());
  const collaborationOrganizations :Map<UUID, Organization> = organizations
    .filter((value, key) => collaborationOrganizationIds.includes(key));
  const collaborationTitle :string = collaboration.get('title', '');
  const collaborationDescription :string = collaboration.get('description', '');

  const filteredDataSetMap = collaborationDataSetMap.filter((dataSetIds, orgId) => {
    if (!filteredOrganizations.isEmpty()) {
      return filteredOrganizations.includes(orgId);
    }
    return true;
  });

  const collaborationDataSets :List<Map> = useSelector(selectOrgsDataSets(filteredDataSetMap));

  const onOrgSelectionChange = (event :SyntheticInputEvent<HTMLInputElement>) => {
    const organizationId :UUID = event.currentTarget.value;
    if (filteredOrganizations.has(organizationId)) {
      setFilteredOrganizations(filteredOrganizations.delete(organizationId));
    }
    else {
      const dataSetsToRemainSelected = collaborationDataSetMap.get(organizationId, List());
      const nextSelecteDataSets = selectedDataSets.filter((dataSetId) => dataSetsToRemainSelected.has(dataSetId));
      setFilteredOrganizations(filteredOrganizations.add(organizationId));
      setSelectedDataSets(nextSelecteDataSets);
    }
  };

  const onDataSetSelectionChange = (event :SyntheticInputEvent<HTMLInputElement>) => {
    const dataSetId :UUID = event.currentTarget.value;
    if (selectedDataSets.has(dataSetId)) {
      setSelectedDataSets(selectedDataSets.delete(dataSetId));
    }
    else {
      setSelectedDataSets(selectedDataSets.add(dataSetId));
    }
  };

  const orgCheckboxButtons = collaborationOrganizations.valueSeq().map((organization) => (
    <StyledCheckbox
        checked={filteredOrganizations.includes(organization.id)}
        key={organization.id}
        label={organization.title}
        mode="button"
        onChange={onOrgSelectionChange}
        value={organization.id} />
  ));

  const dataSetCheckboxButtons = collaborationDataSets.map((dataSet) => {
    const dataSetId = get(dataSet, 'id', '');
    const isSelected = selectedDataSets.includes(get(dataSet, 'id', ''));
    return (
      <>
        <Checkbox
            checked={isSelected}
            key={dataSetId}
            label={<DataSetTitle dataSet={dataSet} />}
            mode="button"
            onChange={onDataSetSelectionChange}
            value={dataSetId} />
        {
          isSelected && (
            <StackGrid>
              <LinkButton>Dataset Details</LinkButton>
            </StackGrid>
          )
        }
      </>
    );
  });

  // TODO: Add 'Add Dataset' button - need to develop desired workflow.
  return (
    <CollaborationWrapper>
      <SubWrapper borderless={false}>
        <StackGrid>
          <Typography variant="h1">Organizations</Typography>
          { orgCheckboxButtons }
        </StackGrid>
      </SubWrapper>
      <SubWrapper>
        <StackGrid gap={32}>
          <StackGrid>
            <Typography variant="h1">{collaborationTitle}</Typography>
            <Typography>{ collaborationDescription }</Typography>
          </StackGrid>
          <ActionsGrid>
            <SearchInput placeholder="Filter datasets" />
            <PlusButton aria-label="add dataset">
              <Typography component="span">Add DataSet</Typography>
            </PlusButton>
          </ActionsGrid>
          <StackGrid>
            { dataSetCheckboxButtons }
          </StackGrid>
          <StackGrid />
        </StackGrid>
      </SubWrapper>
    </CollaborationWrapper>
  );
};

export default CollaborationsContainer;
