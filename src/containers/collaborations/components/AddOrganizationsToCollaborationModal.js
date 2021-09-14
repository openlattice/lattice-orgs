/*
 * @flow
 */

import React from 'react';

import { Modal, Typography } from 'lattice-ui-kit';
import type { UUID } from 'lattice';

import AddOrganizationsToCollaborationModalBody from './AddOrganizationsToCollaborationModalBody';

const AddDataSetToCollaborationModal = ({
  collaborationId,
  isVisible,
  onClose,
  ...rest
} :{
  collaborationId :UUID;
  isVisible :boolean;
  onClose :() => void;
}) => (
  <Modal
    /* eslint-disable-next-line */
        {...rest}
      isVisible={isVisible}
      onClose={onClose}
      textTitle={<Typography variant="h3">Add Organization(s)</Typography>}>
    <AddOrganizationsToCollaborationModalBody
        collaborationId={collaborationId}
        onClose={onClose} />
  </Modal>
);

export default AddDataSetToCollaborationModal;
