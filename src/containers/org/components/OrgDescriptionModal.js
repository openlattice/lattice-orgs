// @flow
import React, { useEffect } from 'react';

import { Modal } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { Organization } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import EditDescriptionBody from './EditDescriptionBody';

import { ORGANIZATIONS } from '../../../core/redux/constants';
import { EDIT_ORGANIZATION_DETAILS } from '../actions';

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

  const requestState :?RequestState = useRequestState([ORGANIZATIONS, EDIT_ORGANIZATION_DETAILS]);

  useEffect(() => {
    if (requestState === RequestStates.SUCCESS) {
      onClose();
    }
  }, [onClose, requestState]);

  return (
    <Modal
        isVisible={isVisible}
        onClose={onClose}
        textTitle="Edit Description"
        viewportScrolling
        withFooter={false}>
      <EditDescriptionBody organization={organization} requestState={requestState} />
    </Modal>
  );
};

export default OrgDescriptionModal;
