/*
 * @flow
 */

import React from 'react';

import { Modal } from 'lattice-ui-kit';
import type { List } from 'immutable';
import type { UUID } from 'lattice';

import AddMembersToOrganizationModalBody from './AddMembersToOrganizationModalBody';

type Props = {
  isVisible :boolean;
  onClose :() => void;
  organizationId :UUID;
  members :List;
};

const AddMembersToOrganizationModal = ({
  isVisible,
  onClose,
  organizationId,
  members,
} :Props) => (
  <Modal
      isVisible={isVisible}
      onClose={onClose}
      textTitle="Add Members"
      viewportScrolling
      withFooter={false}>
    <AddMembersToOrganizationModalBody
        members={members}
        onClose={onClose}
        organizationId={organizationId} />
  </Modal>
);

export default AddMembersToOrganizationModal;
