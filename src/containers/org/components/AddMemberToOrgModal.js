/*
 * @flow
 */

import React from 'react';

import { Modal } from 'lattice-ui-kit';
import type { UUID } from 'lattice';

import AddMemberModalBody from './AddMemberModalBody';

type Props = {
  isVisible :boolean;
  onClose :() => void;
  organizationId :UUID;
};

const AddMemberToOrgModal = ({
  isVisible,
  onClose,
  organizationId,
} :Props) => (
  <Modal
      isVisible={isVisible}
      onClose={onClose}
      textTitle="Add Member"
      viewportScrolling
      withFooter={false}>
    <AddMemberModalBody organizationId={organizationId} />
  </Modal>
);

export default AddMemberToOrgModal;
