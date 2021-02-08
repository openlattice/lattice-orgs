/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import { ActionModal, Typography } from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ModalBody } from '../../../components';
import { resetRequestState } from '../../../core/redux/actions';
import { ORGANIZATIONS } from '../../../core/redux/constants';
import { DELETE_EXISTING_ORGANIZATION, deleteExistingOrganization } from '../actions';

const { isSuccess } = ReduxUtils;

type Props = {
  isOwner :boolean;
  isVisible :boolean;
  onClose :() => void;
  organizationId :UUID;
};

const DeleteOrgModal = ({
  isOwner,
  isVisible,
  onClose,
  organizationId,
} :Props) => {

  const [standbyMessage, updateStandbyMessage] = useState(
    'Are you sure you want to delete this organization? This action cannot be undone.'
  );

  const dispatch = useDispatch();

  const deleteOrgRS :?RequestState = useRequestState([ORGANIZATIONS, DELETE_EXISTING_ORGANIZATION]);

  const handleOnClickPrimary = () => {
    if (isOwner) {
      dispatch(deleteExistingOrganization(organizationId));
    }
    else {
      updateStandbyMessage('You are not authorized to delete this organization.');
    }
  };

  useEffect(() => {
    if (isSuccess(deleteOrgRS)) onClose();
  });

  const rsComponents = {
    [RequestStates.STANDBY]: (
      <ModalBody>
        <Typography>{standbyMessage}</Typography>
      </ModalBody>
    ),
    [RequestStates.SUCCESS]: (
      <ModalBody>
      </ModalBody>
          <Typography>Success!</Typography>
    ),
    [RequestStates.FAILURE]: (
      <ModalBody>
      </ModalBody>
          <Typography>Failed to delete organization. Please try again.</Typography>
    ),
  };

  return (
    <ActionModal
        isVisible={isVisible}
        onClickPrimary={handleOnClickPrimary}
        onClose={onClose}
        requestState={deleteOrgRS}
        requestStateComponents={rsComponents}
        shouldStretchButtons
        textPrimary="Delete"
        textTitle="Delete Organization" />
  );
};

export default DeleteOrgModal;
