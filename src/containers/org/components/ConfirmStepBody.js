// @flow
import React from 'react';

import { ReduxUtils } from 'lattice-utils';
import type { RequestState } from 'redux-reqseq';

import StyledFooter from './styled/StyledFooter';

import StepConfirm from '../../permissions/StepConfirm';
import { ModalBody, ResetOnUnmount } from '../../../components';

const { isPending, isSuccess } = ReduxUtils;

type Props = {
  actions :string[];
  actionText :string;
  confirmMessage :string;
  onBack :() => void;
  onClose :() => void;
  onConfirm :() => void;
  requestState :?RequestState;
  successMessage :string;
};

const ConfirmStepBody = ({
  actions,
  actionText,
  confirmMessage,
  onBack,
  onClose,
  onConfirm,
  requestState,
  successMessage,
} :Props) => {
  const pending = isPending(requestState);
  const success = isSuccess(requestState);
  return (
    <>
      <ModalBody>
        <ResetOnUnmount actions={actions}>
          <StepConfirm
              confirmText={confirmMessage}
              requestState={requestState}
              successText={successMessage} />
        </ResetOnUnmount>
      </ModalBody>
      <StyledFooter
          isPendingPrimary={pending}
          onClickPrimary={success ? onClose : onConfirm}
          onClickSecondary={onBack}
          shouldStretchButtons
          textPrimary={success ? 'Close' : actionText}
          textSecondary={success ? '' : 'Back'} />
    </>
  );
};

export default ConfirmStepBody;
