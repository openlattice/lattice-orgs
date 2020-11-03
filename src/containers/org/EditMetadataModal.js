// @flow
import React, { useEffect, useState } from 'react';

import { Map } from 'immutable';
import { ActionModal } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import EditMetadataBody from './EditMetadataBody';
import ResetOnUnmount from './ResetOnUnmount';
import { EDIT_METADATA, editMetadata } from './actions';

import { SHIPROOM } from '../../core/redux/constants';

const resetStatePath = [EDIT_METADATA];

type Props = {
  isVisible :boolean;
  metadata ?:Map;
  onClose :() => void;
  property :Object;
};

const EditMetadataModal = ({
  isVisible,
  metadata,
  onClose,
  property,
} :Props) => {
  const dispatch = useDispatch();
  const requestState :?RequestState = useRequestState([SHIPROOM, EDIT_METADATA]);
  const [inputState, setInputState] = useState({
    description: '',
    title: '',
  });

  useEffect(() => {
    setInputState({
      description: property?.description || '',
      title: property?.title || '',
    });
  }, [property]);

  const handleChangeInputs = (e :SyntheticEvent<HTMLInputElement>) => {
    setInputState({ ...inputState, [e.currentTarget.name]: e.currentTarget.value });
  };

  const handleSubmit = () => {
    dispatch(editMetadata({
      inputState,
      metadata,
      property,
    }));
  };

  const rsComponents = {
    [RequestStates.STANDBY]: (
      <EditMetadataBody inputState={inputState} onChange={handleChangeInputs} />
    ),
    [RequestStates.SUCCESS]: (
      <ResetOnUnmount path={resetStatePath} message="Success!" />
    ),
    [RequestStates.FAILURE]: (
      <ResetOnUnmount path={resetStatePath} message="Failed to save changes. Please try again." />
    ),
  };

  return (
    <ActionModal
        isVisible={isVisible}
        onClickPrimary={handleSubmit}
        onClose={onClose}
        requestState={requestState}
        requestStateComponents={rsComponents}
        shouldStretchButtons
        textPrimary="Save Changes"
        textSecondary=""
        textTitle="Edit Property" />
  );
};

EditMetadataModal.defaultProps = {
  metadata: Map()
};

export default EditMetadataModal;
