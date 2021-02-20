/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import _isFunction from 'lodash/isFunction';
import { Form } from 'lattice-fabricate';
import { Modal, ModalFooter, Typography } from 'lattice-ui-kit';
import { ReduxUtils } from 'lattice-utils';
import type { RequestState } from 'redux-reqseq';

import { ModalBody, ResetOnUnmount, StackGrid } from '..';

const { isFailure, isPending, isSuccess } = ReduxUtils;

type MetaFields = {
  description :string;
  title :string;
};

type FormData = {|
  fields :MetaFields;
|};

const UpdateMetaModal = ({
  isVisible,
  onClose,
  onSubmit,
  requestState,
  requestStateAction,
  schema,
} :{|
  isVisible :boolean;
  onClose :() => void;
  onSubmit :(data :MetaFields) => void;
  requestState :?RequestState;
  requestStateAction :string;
  schema :{|
    dataSchema :Object;
    uiSchema :Object;
  |};
|}) => {

  const [data, setData] = useState({});
  const resetActions = useMemo(() => [requestStateAction], [requestStateAction]);

  useEffect(() => {
    setData({});
  }, [schema]);

  useEffect(() => {
    // WARNING: this has the potential for an infinite loop if "isVisible" is not in the condition
    if (isSuccess(requestState) && isVisible) {
      if (_isFunction(onClose)) {
        onClose();
      }
    }
  }, [isVisible, onClose, requestState]);

  const handleOnChangeForm = ({ formData } :{ formData :FormData }) => {
    setData(formData);
  };

  const handleOnClickPrimary = () => {
    if (_isFunction(onSubmit)) {
      onSubmit(data.fields);
    }
  };

  const withFooter = (
    <ModalFooter
        isPendingPrimary={isPending(requestState)}
        isDisabledSecondary={isPending(requestState)}
        onClickPrimary={handleOnClickPrimary}
        onClickSecondary={onClose}
        textPrimary="Submit"
        textSecondary="Cancel"
        withFooter />
  );

  return (
    <Modal
        isVisible={isVisible}
        onClose={onClose}
        textTitle="Edit Details"
        withFooter={withFooter}>
      <ResetOnUnmount actions={resetActions}>
        <ModalBody>
          <StackGrid>
            <Form
                formData={data}
                hideSubmit
                noPadding
                onChange={handleOnChangeForm}
                schema={schema.dataSchema}
                uiSchema={schema.uiSchema} />
            {
              isFailure(requestState) && (
                <Typography color="error">Failed to save changes. Please try again.</Typography>
              )
            }
          </StackGrid>
        </ModalBody>
      </ResetOnUnmount>
    </Modal>
  );
};

export default UpdateMetaModal;
