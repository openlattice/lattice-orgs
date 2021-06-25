/*
 * @flow
 */

import React, { Fragment, useMemo, useState } from 'react';

import styled from 'styled-components';
import { Map, Set } from 'immutable';
import { Checkbox, Typography } from 'lattice-ui-kit';
import { useRequestState, ReduxUtils } from 'lattice-utils';
import { useSelector } from 'react-redux';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import EntityNeighborsTable from './EntityNeighborsTable';
import { EXPLORE_ENTITY_NEIGHBORS } from './actions';

import {
  CrumbSeparator,
  DataSetTitle,
  Divider,
  Spinner
} from '../../components';
import { EXPLORE } from '../../core/redux/constants';
import { selectOrgDataSets } from '../../core/redux/selectors';

const ContainerWrapper = styled.div`
  min-height: 500px;
`;

const FlexWrapper = styled.div`
  display: flex;
  align-items: center;

  svg {
    margin-right: 5px;
  }
`;

const { isPending } = ReduxUtils;

type Props = {
  isModal :boolean;
  neighbors :Map;
  organizationId :UUID;
};

const EntityNeighborsContainer = ({ isModal, neighbors, organizationId } :Props) => {
  const [visibleOptions, setVisibleOptions] = useState(Map());
  const [visibleNeighbors, setVisibleNeighbors] = useState(Set());
  const exploreEntityNeighborsRS :?RequestState = useRequestState([EXPLORE, EXPLORE_ENTITY_NEIGHBORS]);

  const associationEntitySetIds :Set<UUID> = useMemo(() => (neighbors.keySeq().toSet()), [neighbors]);

  const dataSetIds :Set<UUID> = useMemo(() => (
    Set().withMutations((set) => {
      neighbors.reduce((ids :Set<UUID>, esNeighborsMap :Map) => ids.add(esNeighborsMap.keySeq()), set);
    }).flatten()
  ), [neighbors]);

  const dataSetsMap :Map = useSelector(selectOrgDataSets(organizationId, dataSetIds));
  const associationEntitySetsMap = useSelector(selectOrgDataSets(organizationId, associationEntitySetIds));

  const handleAssociationOnClick = (event :SyntheticEvent<HTMLButtonElement>) => {
    const { currentTarget } = event;
    if (currentTarget instanceof HTMLElement) {
      const { value: dataSetId } = currentTarget;
      if (dataSetId) {
        if (visibleOptions.get(dataSetId, Set()).isEmpty()) {
          const neighborsDataSetIds :Set = neighbors.get(dataSetId, Map()).keySeq().toSet();
          setVisibleOptions(visibleOptions.set(dataSetId, neighborsDataSetIds));
        }
        else {
          setVisibleOptions(visibleOptions.delete(dataSetId));
        }
      }
    }
  };

  const handleNeighborOnClick = (event :SyntheticEvent<HTMLButtonElement>) => {
    const { currentTarget } = event;
    if (currentTarget instanceof HTMLElement) {
      const { value: entitySetId } = currentTarget;
      if (visibleNeighbors.includes(entitySetId)) {
        setVisibleNeighbors(visibleNeighbors.delete(entitySetId));
      }
      else {
        setVisibleNeighbors(visibleNeighbors.add(entitySetId));
      }
    }
  };

  const associationEntitySetChips = associationEntitySetsMap.valueSeq().map((associationEntitySet :Map) => {
    const associationEntitySetName = associationEntitySet.get('title') || associationEntitySet.get('name');
    const associationEntitySetId = associationEntitySet.get('id');
    return (
      <Checkbox
          checked={!visibleOptions.get(associationEntitySetId, Set()).isEmpty()}
          key={associationEntitySetId}
          label={associationEntitySetName}
          mode="chip"
          onChange={handleAssociationOnClick}
          value={associationEntitySetId} />
    );
  });

  const neighborDataSetChips = visibleOptions.valueSeq().flatten().toSet().map((neighborESID :UUID) => {
    const neighborDataSet = dataSetsMap.get(neighborESID, Map());
    const neighborDataSetName = neighborDataSet.get('title') || neighborDataSet.get('name');
    const neighborDataSetId = neighborDataSet.get('id');
    return (
      <Checkbox
          checked={visibleNeighbors.includes(neighborDataSetId)}
          key={neighborDataSetId}
          label={neighborDataSetName}
          mode="chip"
          onChange={handleNeighborOnClick}
          value={neighborDataSetId} />
    );
  });

  const visibleNeighborTables = visibleOptions.entrySeq().map(([associationESID, neighborESIDs]) => {
    const associationEntitySet = associationEntitySetsMap.get(associationESID, Map());
    const associationEntitySetId = associationEntitySet.get('id');
    return visibleNeighbors.some((neighborESID) => neighborESIDs.includes(neighborESID))
      && (
        <Fragment key={associationEntitySetId}>
          <br />
          {
            neighborESIDs.map((neighborESID) => {
              const neighborDataSet = dataSetsMap.get(neighborESID, Map());
              const neighborDataSetId = neighborDataSet.get('id');
              return visibleNeighbors.includes(neighborDataSetId) && (
                <Fragment key={neighborDataSetId}>
                  <Divider isVisible={false} margin={15} />
                  <FlexWrapper>
                    <CrumbSeparator />
                    <DataSetTitle dataSet={associationEntitySet} />
                    <CrumbSeparator />
                    <DataSetTitle dataSet={neighborDataSet} />
                  </FlexWrapper>
                  <Divider isVisible={false} margin={15} />
                  <EntityNeighborsTable
                      associationDataSet={associationEntitySet}
                      key={neighborDataSetId}
                      dataSet={neighborDataSet}
                      isModal={isModal}
                      neighbors={neighbors.getIn([associationEntitySetId, neighborDataSetId], Map())}
                      organizationId={organizationId} />
                </Fragment>
              );
            })
          }
        </Fragment>
      );
  });

  if (isPending(exploreEntityNeighborsRS)) {
    return (
      <Spinner />
    );
  }

  if (associationEntitySetIds.isEmpty()) {
    return (
      <Typography gutterBottom variant="subtitle1">The selected entity has no neighbors.</Typography>
    );
  }

  return (
    <ContainerWrapper>
      <Typography gutterBottom variant="subtitle1">Association Entity Sets:</Typography>
      <Divider isVisible={false} margin={15} />
      { associationEntitySetChips }
      <Divider isVisible={false} margin={15} />
      {
        !visibleOptions.isEmpty() && (
          <>
            <Typography gutterBottom variant="subtitle1">Destination Entity Sets:</Typography>
            <Divider isVisible={false} margin={15} />
            { neighborDataSetChips }
            <Divider isVisible={false} margin={15} />
            { visibleNeighborTables }
          </>
        )
      }
    </ContainerWrapper>
  );
};

export default EntityNeighborsContainer;
