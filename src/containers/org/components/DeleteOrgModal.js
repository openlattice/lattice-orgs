/*
 * @flow
 */

import React from 'react';

import { ActionModal } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Organization } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ModalBody } from '../../../components';
import { resetRequestState } from '../../../core/redux/actions';
import { ORGANIZATIONS } from '../../../core/redux/constants';
import { DELETE_ORGANIZATION, deleteOrganization } from '../actions';

type Props = {
  isVisible :boolean;
  onClose :() => void;
  organization :Organization;
};

const DeleteOrgModal = ({ isVisible, onClose, organization } :Props) => {

  const dispatch = useDispatch();

  const createOrganizationRS :?RequestState = useRequestState([ORGANIZATIONS, DELETE_ORGANIZATION]);

  const handleOnClickPrimary = () => {
    dispatch(deleteOrganization(organization));
  };

  const handleOnClose = () => {
    onClose();
    setTimeout(() => {
      dispatch(resetRequestState([DELETE_ORGANIZATION]));
    }, 1000);
  };

  const rsComponents = {
    [RequestStates.STANDBY]: (
      <ModalBody>
        <span>Are you sure you want to delete this organization? This action cannot be undone.</span>
      </ModalBody>
    ),
    [RequestStates.SUCCESS]: (
      <ModalBody>
        <span>Success!</span>
      </ModalBody>
    ),
    [RequestStates.FAILURE]: (
      <ModalBody>
        <span>Failed to delete organization. Please try again.</span>
      </ModalBody>
    ),
  };

  return (
    <ActionModal
        isVisible={isVisible}
        onClickPrimary={handleOnClickPrimary}
        onClose={handleOnClose}
        requestState={createOrganizationRS}
        requestStateComponents={rsComponents}
        shouldStretchButtons
        textPrimary="Delete"
        textTitle="Delete Organization" />
  );
};

export default DeleteOrgModal;
