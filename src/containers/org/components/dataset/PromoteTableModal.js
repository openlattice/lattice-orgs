// @flow
import React, { useEffect } from 'react';

import { OrganizationsApiActions } from 'lattice-sagas';
import { Modal } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import PromoteBody from './PromoteBody';

import { EDM } from '../../../../core/redux/constants';

const { PROMOTE_STAGING_TABLE } = OrganizationsApiActions;

type Props = {
  isVisible :boolean;
  onClose :() => void;
  dataSet :any;
  organizationId :UUID;
};

const PromoteTableModal = ({
  dataSet,
  isVisible,
  onClose,
  organizationId,
} :Props) => {

  const requestState :?RequestState = useRequestState([EDM, PROMOTE_STAGING_TABLE]);

  useEffect(() => {
    if (requestState === RequestStates.SUCCESS) {
      onClose();
    }
  }, [onClose, requestState]);

  return (
    <Modal
        isVisible={isVisible}
        onClose={onClose}
        textTitle="Promote Data Set"
        viewportScrolling
        withFooter={false}>
      <PromoteBody
          dataSet={dataSet}
          organizationId={organizationId}
          requestState={requestState} />
    </Modal>
  );
};

export default PromoteTableModal;
