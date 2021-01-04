// @flow
import React, { useEffect } from 'react';

import { useDispatch } from 'react-redux';
import { Modal } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { Organization, Role } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import EditRoleDetailsBody from './EditRoleDetailsBody';

import { ORGANIZATIONS } from '../../../core/redux/constants';
import { resetRequestState } from '../../../core/redux/actions';
import { EDIT_ROLE_DETAILS } from '../actions';

type Props = {
  isVisible :boolean;
  onClose :() => void;
  organization :Organization;
  role :Role;
};

const RoleDetailsModal = ({
  isVisible,
  onClose,
  organization,
  role
} :Props) => {
  const dispatch = useDispatch();
  const requestState :?RequestState = useRequestState([ORGANIZATIONS, EDIT_ROLE_DETAILS]);

  useEffect(() => {
    if (requestState === RequestStates.SUCCESS) {
      onClose();
      // the timeout avoids rendering the modal with new state before the transition animation finishes
      setTimeout(() => {
        dispatch(resetRequestState([EDIT_ROLE_DETAILS]));
      }, 1000);
    }
  }, [dispatch, onClose, requestState]);

  return (
    <Modal
        isVisible={isVisible}
        onClose={onClose}
        textTitle="Edit Role Details"
        viewportScrolling
        withFooter={false}>
      <EditRoleDetailsBody organization={organization} requestState={requestState} role={role} />
    </Modal>
  );
};

export default RoleDetailsModal;
