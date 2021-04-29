/*
 * @flow
 */

import React, { useMemo, useState } from 'react';

import styled from 'styled-components';
import { faChevronCircleDown } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map, Set } from 'immutable';
import { Models } from 'lattice';
import { CardStack, Spinner } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import EntityNeighborsCardContainer from './EntityNeighborsCardContainer';
import { EXPLORE_ENTITY_NEIGHBORS } from './actions';

import { DataSetTitle, FlipButton } from '../../components';
import { EXPLORE } from '../../core/redux/constants';
import { selectOrgDataSets } from '../../core/redux/selectors';

const { EntitySet } = Models;

const ContainerWrapper = styled.div`
  min-height: 500px;
`;

const AssociationSection = styled.section`
  padding-bottom: 30px;

  &:last-child {
    padding-bottom: 0;
  }
`;

const SectionHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const HeaderSectionButton = styled(FlipButton)`
  > button {
    background-color: transparent;
    padding: 4px;
  }
`;

type Props = {
  neighbors :Map;
  organizationId :UUID;
};

const EntityNeighborsContainer = ({ neighbors, organizationId } :Props) => {

  const [visibleSections, setVisibleSections] = useState(Map());
  const exploreEntityNeighborsRS :?RequestState = useRequestState([EXPLORE, EXPLORE_ENTITY_NEIGHBORS]);

  const associationEntitySetIds :Set<UUID> = useMemo(() => (
    neighbors ? neighbors.keySeq().toSet() : Set()
  ), [neighbors]);

  const dataSetIds :Set<UUID> = useMemo(() => (
    Set().withMutations((set) => {
      if (neighbors) {
        neighbors.reduce((ids :Set<UUID>, esNeighborsMap :Map) => ids.add(esNeighborsMap.keySeq()), set);
      }
    }).flatten()
  ), [neighbors]);

  const dataSetsMap :Map = useSelector(selectOrgDataSets(organizationId, dataSetIds));
  const associationEntitySetsMap = useSelector(selectOrgDataSets(organizationId, associationEntitySetIds));

  const handleOnClick = (event :SyntheticEvent<HTMLButtonElement>) => {
    const { currentTarget } = event;
    if (currentTarget instanceof HTMLElement) {
      const { dataset } = currentTarget;
      if (dataset.entitySetId) {
        const isVisible = visibleSections.get(dataset.entitySetId) || false;
        setVisibleSections(visibleSections.set(dataset.entitySetId, !isVisible));
      }
    }
  };

  if (exploreEntityNeighborsRS === RequestStates.PENDING) {
    return (
      <Spinner size="2x" />
    );
  }

  return (
    <ContainerWrapper>
      {
        associationEntitySetsMap.valueSeq().map((associationEntitySet :Map) => (
          <AssociationSection key={associationEntitySet.get('id')}>
            <SectionHeader>
              <DataSetTitle comoponent="h2" dataSet={associationEntitySet} />
              <HeaderSectionButton
                  flip={visibleSections.get(associationEntitySet.get('id'))}
                  data-entity-set-id={associationEntitySet.get('id')}
                  onClick={handleOnClick}>
                <FontAwesomeIcon fixedWidth icon={faChevronCircleDown} size="2x" />
              </HeaderSectionButton>
            </SectionHeader>
            {
              visibleSections.has(associationEntitySet.get('id')) && (
                <>
                  <br />
                  <CardStack>
                    {
                      neighbors
                        .get(associationEntitySet.get('id'))
                        .map((dataSetNeighbors, dataSetId :UUID) => {
                          const dataSet :?Map = dataSetsMap.get(dataSetId);
                          if (dataSet) {
                            return (
                              <EntityNeighborsCardContainer
                                  key={dataSet.get('id')}
                                  dataSet={dataSet}
                                  neighbors={dataSetNeighbors}
                                  organizationId={organizationId} />
                            );
                          }
                          return null;
                        })
                        .toList()
                    }
                  </CardStack>
                </>
              )
            }
          </AssociationSection>
        ))
      }
    </ContainerWrapper>
  );
};

export default EntityNeighborsContainer;
