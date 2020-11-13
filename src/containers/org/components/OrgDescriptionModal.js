// @flow
import React from 'react';

import { Modal, ModalFooter, ModalHeader } from 'lattice-ui-kit';
import type { Organization, UUID } from 'lattice';

type Props = {
  isVisible :boolean;
  onClose :() => void;
  organization :Organization;
};

const OrgDescriptionModal = ({
  isVisible,
  onClose,
  organization,
} :Props) => {
  return (
    <Modal
      isVisible={isVisible}
      onClose={onClose}
      textTitle="Edit Description"
      viewportScrolling
      withFooter={false} />
  );
};

export default OrgDescriptionModal;
