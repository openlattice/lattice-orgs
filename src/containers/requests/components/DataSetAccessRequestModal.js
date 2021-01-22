/*
 * @flow
 */

import React, { useEffect, useMemo, useReducer, useState } from 'react';

import styled from 'styled-components';
import { List, Map, Set } from 'immutable';
import { Form } from 'lattice-fabricate';
import { Modal, Typography } from 'lattice-ui-kit';
import {
  DataUtils,
  DateTimeUtils,
  ReduxUtils,
  useRequestState,
} from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ModalBody } from '../../../components';
import { FQNS } from '../../../core/edm/constants';

const { getEntityKeyId, getPropertyValue } = DataUtils;

const DataSetAccessRequestModal = ({
  accessRequest,
  onClose,
} :{|
  accessRequest :Map;
  onClose :() => void;
|}) => {

  const [isVisible, setIsVisible] = useState(false);
  const [data, setData] = useState({});
  const [schema, setSchema] = useState({ dataSchema: {}, uiSchema: {} });

  useEffect(() => {
    try {
      const parsedData = JSON.parse(getPropertyValue(accessRequest, [FQNS.OL_TEXT, 0]));
      const parsedSchema = JSON.parse(getPropertyValue(accessRequest, [FQNS.OL_SCHEMA, 0]));
      setData(parsedData);
      setSchema(parsedSchema);
      // set isVisible to true if all goes well
      setIsVisible(true);
    }
    catch (e) { /**/ }
  }, [accessRequest]);

  const handleOnClose = () => {
    setIsVisible(false);
    onClose();
  };

  return (
    <Modal
        isVisible={isVisible}
        onClickPrimary={() => {}}
        onClickSecondary={() => {}}
        onClose={handleOnClose}
        textPrimary="Approve"
        textSecondary="Reject"
        textTitle="Review Access Request"
        viewportScrolling>
      <ModalBody>
        <Form
            formData={data}
            hideSubmit
            noPadding
            readOnly
            schema={schema.dataSchema}
            uiSchema={schema.uiSchema} />
      </ModalBody>
    </Modal>
  );
};

export default DataSetAccessRequestModal;
