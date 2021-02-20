/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

import _isFunction from 'lodash/isFunction';
import { Form } from 'lattice-fabricate';
import { ActionModal, Typography } from 'lattice-ui-kit';
import { ReduxUtils } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import ModalBody from './ModalBody';

import { ResetOnUnmount } from '..';

const { isSuccess } = ReduxUtils;

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
    if (isSuccess(requestState)) {
      if (_isFunction(onClose)) {
        onClose();
      }
    }
  }, [onClose, requestState]);

  const handleOnChange = ({ formData } :{ formData :FormData }) => {
    setData(formData);
  };

  const handleOnSubmit = () => {
    if (_isFunction(onSubmit)) {
      onSubmit(data.fields);
    }
  };

  const rsComponents = {
    // TODO: don't force the user to have to pass null or <></> for the RequestState they don't care about
    [RequestStates.STANDBY]: <></>,
    [RequestStates.SUCCESS]: <></>,
    [RequestStates.FAILURE]: (
      <ModalBody>
        <Typography color="error">Failed to save changes. Please try again.</Typography>
      </ModalBody>
    ),
  };

  return (
    <ActionModal
        isVisible={isVisible}
        onClickPrimary={handleOnSubmit}
        onClose={onClose}
        requestState={requestState}
        requestStateComponents={rsComponents}
        textPrimary="Submit"
        textSecondary="Cancel"
        textTitle="Edit Details">
      <ResetOnUnmount actions={resetActions}>
        <ModalBody>
          <Form
              formData={data}
              hideSubmit
              noPadding
              onChange={handleOnChange}
              schema={schema.dataSchema}
              uiSchema={schema.uiSchema} />
        </ModalBody>
      </ResetOnUnmount>
    </ActionModal>
  );
};

export default UpdateMetaModal;
