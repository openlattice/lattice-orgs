/*
 * @flow
 */

import React, { useCallback, useEffect, useState } from 'react';

import { Map } from 'immutable';
import { Form } from 'lattice-fabricate';
import { ActionModal } from 'lattice-ui-kit';
import { DataUtils, ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ModalBody } from '../../../components';
import { FQNS } from '../../../core/edm/constants';
import { REQUESTS } from '../../../core/redux/constants';
import { SUBMIT_DATA_SET_ACCESS_RESPONSE, submitDataSetAccessResponse } from '../actions';
import { RequestStatusTypes } from '../constants';

const { getEntityKeyId, getPropertyValue } = DataUtils;
const { isSuccess } = ReduxUtils;

const DataSetAccessRequestModal = ({
  dataSetId,
  onClose,
  organizationId,
  request,
} :{|
  dataSetId :UUID;
  onClose :() => void;
  organizationId :UUID;
  request :Map;
|}) => {

  const dispatch = useDispatch();

  const submitRS :?RequestState = useRequestState([REQUESTS, SUBMIT_DATA_SET_ACCESS_RESPONSE]);

  const [isVisible, setIsVisible] = useState(false);
  const [data, setData] = useState({});
  const [schema, setSchema] = useState({ dataSchema: {}, uiSchema: {} });

  useEffect(() => {
    try {
      const parsedData = JSON.parse(getPropertyValue(request, [FQNS.OL_TEXT, 0]));
      const parsedSchema = JSON.parse(getPropertyValue(request, [FQNS.OL_SCHEMA, 0]));
      setData(parsedData);
      setSchema(parsedSchema);
      // set isVisible to true if all goes well
      setIsVisible(true);
    }
    catch (e) { /**/ }
  }, [request]);

  const handleOnClose = useCallback(() => {
    setIsVisible(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isSuccess(submitRS)) {
      handleOnClose();
    }
  }, [handleOnClose, submitRS]);

  const handleOnClickPrimary = () => {
    dispatch(
      submitDataSetAccessResponse({
        dataSetId,
        entityKeyId: getEntityKeyId(request),
        organizationId,
        status: RequestStatusTypes.APPROVED,
      })
    );
  };

  const handleOnClickSecondary = () => {
    dispatch(
      submitDataSetAccessResponse({
        dataSetId,
        entityKeyId: getEntityKeyId(request),
        organizationId,
        status: RequestStatusTypes.REJECTED,
      })
    );
  };

  const rsComponents = {
    [RequestStates.STANDBY]: <></>,
    [RequestStates.SUCCESS]: <></>,
    [RequestStates.FAILURE]: <></>,
  };

  return (
    <ActionModal
        isVisible={isVisible}
        onClickPrimary={handleOnClickPrimary}
        onClickSecondary={handleOnClickSecondary}
        onClose={handleOnClose}
        requestState={submitRS}
        requestStateComponents={rsComponents}
        textPrimary="Approve"
        textSecondary="Reject"
        textTitle="Review Access Request">
      <ModalBody>
        <Form
            formData={data}
            hideSubmit
            noPadding
            readOnly
            schema={schema.dataSchema}
            uiSchema={schema.uiSchema} />
      </ModalBody>
    </ActionModal>
  );
};

export default DataSetAccessRequestModal;
