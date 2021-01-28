/*
 * @flow
 */

import React from 'react';

import { Modal } from 'lattice-ui-kit';
import type { List } from 'immutable';
import type { UUID } from 'lattice';

import AddMemberModalBody from './AddMemberModalBody';

type Props = {
  isVisible :boolean;
  onClose :() => void;
  organizationId :UUID;
  members :List;
};

const AddMemberToOrgModal = ({
  isVisible,
  onClose,
  organizationId,
  members,
} :Props) => (
  <Modal
      isVisible={isVisible}
      onClose={onClose}
      textTitle="Add Member"
      viewportScrolling
      withFooter={false}>
    <AddMemberModalBody members={members} organizationId={organizationId} />
  </Modal>
);

export default AddMemberToOrgModal;
