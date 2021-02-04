/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import { ActionModal } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import EditMetadataBody from './EditMetadataBody';
import ResetOnUnmount from './ResetOnUnmount';

import { UPDATE_DATA_SET_METADATA, updateDataSetMetaData } from '../../../core/edm/actions';
import { EDM } from '../../../core/redux/constants';

const resetStatePath = [UPDATE_DATA_SET_METADATA];

const EditMetadataModal = ({
  data,
  dataSetId,
  isColumn,
  isVisible,
  onClose,
  organizationId,
} :{|
  data :{
    description ?:string;
    id ?:UUID;
    title ?:string;
  };
  dataSetId :UUID;
  isColumn :boolean;
  isVisible :boolean;
  onClose :() => void;
  organizationId :UUID;
|}) => {

  const dispatch = useDispatch();
  const [inputState, setInputState] = useState({ description: '', title: '' });

  const updateDataSetMetaDataRS :?RequestState = useRequestState([EDM, UPDATE_DATA_SET_METADATA]);

  useEffect(() => {
    setInputState({
      description: data?.description || '',
      title: data?.title || '',
    });
  }, [data]);

  const handleChangeInputs = (e :SyntheticEvent<HTMLInputElement>) => {
    setInputState({ ...inputState, [e.currentTarget.name]: e.currentTarget.value });
  };

  const handleSubmit = () => {
    dispatch(
      updateDataSetMetaData({
        dataSetId,
        description: inputState.description,
        entityKeyId: data.id,
        isColumn,
        organizationId,
        title: inputState.title,
      })
    );
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
        requestState={updateDataSetMetaDataRS}
        requestStateComponents={rsComponents}
        shouldStretchButtons
        textPrimary="Save Changes"
        textSecondary=""
        textTitle="Edit Property" />
  );
};

export default EditMetadataModal;
