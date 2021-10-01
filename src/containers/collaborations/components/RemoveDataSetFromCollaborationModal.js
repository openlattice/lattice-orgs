/*
 * @flow
 */

import React from 'react';

import { Map, get } from 'immutable';
import { CollaborationsApiActions } from 'lattice-sagas';
import { ActionModal, Typography } from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  COLLABORATIONS,
  ID,
  NAME,
  ORGANIZATION_ID,
  TITLE,
} from '../../../common/constants';
import { ModalBody, ResetOnUnmount } from '../../../components';

const { isSuccess } = ReduxUtils;

const { REMOVE_DATA_SET_FROM_COLLABORATION, removeDataSetFromCollaboration } = CollaborationsApiActions;

const RESET_ACTIONS = [REMOVE_DATA_SET_FROM_COLLABORATION];

const RemoveDataSetFromCollaborationModal = ({
  collaborationId,
  dataSet,
  isVisible,
  onClose
} :{
  collaborationId :UUID;
  dataSet :Map;
  isVisible :boolean;
  onClose :() => void;
}) => {
  const dispatch = useDispatch();
  const dataSetId = get(dataSet, ID);
  const dataSetName = get(dataSet, NAME);
  const dataSetTitle = get(dataSet, TITLE);
  const organizationId = get(dataSet, ORGANIZATION_ID);
  const removeDataSetRS :?RequestState = useRequestState([COLLABORATIONS, REMOVE_DATA_SET_FROM_COLLABORATION]);

  const success = isSuccess(removeDataSetRS);

  const rsComponents = {
    [RequestStates.STANDBY]: (
      <ModalBody>
        <span>
          {`Are you sure you want to remove the data set ${dataSetTitle || dataSetName} from this collaboration?`}
        </span>
      </ModalBody>
    ),
    [RequestStates.SUCCESS]: (
      <ResetOnUnmount actions={RESET_ACTIONS}>
        <Typography>{`${dataSetTitle || dataSetName} was successfully removed from the collaboration.`}</Typography>
      </ResetOnUnmount>
    ),
    [RequestStates.FAILURE]: (
      <ResetOnUnmount actions={RESET_ACTIONS}>
        <Typography>Failed to remove the data set. Please try again.</Typography>
      </ResetOnUnmount>
    ),
  };

  const handleOnClickPrimary = () => {
    dispatch(
      removeDataSetFromCollaboration({
        collaborationId,
        dataSetId,
        organizationId
      })
    );
  };

  return (
    <ActionModal
        isVisible={isVisible}
        onClickPrimary={handleOnClickPrimary}
        onClose={onClose}
        requestState={removeDataSetRS}
        requestStateComponents={rsComponents}
        textPrimary="Remove"
        textTitle={
          success
            ? <Typography variant="h2">Data Set Removed</Typography>
            : <Typography variant="h2">Remove Data Set</Typography>
        } />
  );
};

export default RemoveDataSetFromCollaborationModal;
