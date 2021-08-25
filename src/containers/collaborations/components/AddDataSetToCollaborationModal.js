/*
 * @flow
 */

import React, { useState } from 'react';

import { List } from 'immutable';
import { Modal, Typography } from 'lattice-ui-kit';
import type { UUID } from 'lattice';

import AddDataSetToCollaborationModalBody from './AddDataSetToCollaborationModalBody';

const AddDataSetToCollaborationModal = ({
  collaborationId,
  existingDataSets,
  isVisible,
  onClose,
  ...rest
} :{
  collaborationId :UUID;
  existingDataSets :List;
  isVisible :boolean;
  onClose :() => void;
}) => {
  const [modalTitle, setModalTitle] = useState('Select Organization');

  return (
    <Modal
      /* eslint-disable-next-line */
        {...rest}
        isVisible={isVisible}
        onClose={onClose}
        textTitle={<Typography variant="h3">{modalTitle}</Typography>}>
      <AddDataSetToCollaborationModalBody
          collaborationId={collaborationId}
          existingDataSets={existingDataSets}
          onClose={onClose}
          setModalTitle={setModalTitle} />
    </Modal>
  );
};

export default AddDataSetToCollaborationModal;
