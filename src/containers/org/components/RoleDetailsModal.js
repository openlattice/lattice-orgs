// @flow
import React, { useEffect } from 'react';

import { Modal } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { Organization, Role } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import EditRoleDetailsBody from './EditRoleDetailsBody';

import { ORGANIZATIONS } from '../../../core/redux/constants';
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

  const requestState :?RequestState = useRequestState([ORGANIZATIONS, EDIT_ROLE_DETAILS]);

  useEffect(() => {
    if (requestState === RequestStates.SUCCESS) {
      onClose();
    }
  }, [onClose, requestState]);

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
