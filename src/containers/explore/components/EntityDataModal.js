/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import { Map } from 'immutable';
import styled from 'styled-components';
import {
  Banner,
  Colors,
  Input,
  Modal,
  ModalHeader,
  Spinner,
  Typography
} from 'lattice-ui-kit';
import { ReduxUtils, ValidationUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ModalBody, ResetOnUnmount } from '../../../components';
import { resetRequestStates } from '../../../core/redux/actions';
import {
  EXPLORE_ENTITY_DATA,
  EXPLORE_ENTITY_NEIGHBORS,
  exploreEntityData,
  exploreEntityNeighbors
} from '../actions';
import { selectOrgDataSetColumns } from '../../../core/redux/selectors';
import { EXPLORE, ENTITY_NEIGHBORS_MAP, SELECTED_ENTITY_DATA } from '../../../core/redux/constants';

const { NEUTRAL } = Colors;
const { isPending, reduceRequestStates } = ReduxUtils;
const { isValidUUID } = ValidationUtils;

const StyledModalHeader = styled(ModalHeader)`
  background: ${NEUTRAL.N600};
  text-align: center;

  h1 {
    color: white;
  }
`;

const EntityKeyId = styled(Typography)`
  padding: 20px 0;
`;

const DeleteOrgModal = ({
  dataSetId,
  dataSetName,
  entityKeyId,
  isVisible,
  onClose,
  organizationId
} :{|
  dataSetId :UUID;
  dataSetName :string;
  entityKeyId :UUID;
  isVisible :boolean;
  onClose :() => void;
  organizationId :UUID;
|}) => {
  const dispatch = useDispatch();

  const exploreEntityDataRS :?RequestState = useRequestState([EXPLORE, EXPLORE_ENTITY_DATA, entityKeyId]);
  const exploreEntityNeighborsRS :?RequestState = useRequestState([EXPLORE, EXPLORE_ENTITY_NEIGHBORS, entityKeyId]);
  const reducedRequestState :?RequestState = reduceRequestStates([exploreEntityDataRS, exploreEntityNeighborsRS]);

  const dataSetColumns :List<Map<FQN, List>> = useSelector(selectOrgDataSetColumns(organizationId, dataSetId));
  const neighbors :?Map = useSelector((s) => s.getIn([EXPLORE, ENTITY_NEIGHBORS_MAP, entityKeyId], Map()));
  const entityData :?Map = useSelector((s) => s.getIn([EXPLORE, SELECTED_ENTITY_DATA], Map()));

  useEffect(() => {
    if (isValidUUID(entityKeyId) && isValidUUID(dataSetId)) {
      dispatch(exploreEntityData({ entityKeyId, entitySetId: dataSetId }));
      dispatch(exploreEntityNeighbors({ entityKeyId, entitySetId: dataSetId }));
    }
  }, [dispatch, entityKeyId, dataSetId]);

  const header = (
    <StyledModalHeader textTitle={`Examining ${dataSetName}: ${entityKeyId}`} onClose={onClose}>
      <Banner isOpen>{`Examining ${dataSetName}: ${entityKeyId}`}</Banner>
    </StyledModalHeader>
  );

  return (
    <Modal
        isVisible={isVisible}
        onClose={onClose}
        withHeader={header}>
      {
        isPending(reducedRequestState)
          ? (
            <Spinner />
          )
          : (
            <ModalBody>
              <EntityKeyId variant="h1">{entityKeyId}</EntityKeyId>
            </ModalBody>
          )
      }
    </Modal>
  );
};

export default DeleteOrgModal;
