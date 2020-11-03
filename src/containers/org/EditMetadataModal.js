// @flow
import React, { useEffect, useState } from 'react';

import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { useDispatch } from 'react-redux';

import EditMetadataBody from './EditMetadataBody';
import { editMetadata } from './actions';

type Props = {
  isVisible :boolean;
  metadata ?:Map;
  columnInfo ?:Array<Object>;
  onClose :() => void;
  property :Object;
};

const EditMetadataModal = ({
  isVisible,
  metadata,
  columnInfo,
  onClose,
  property,
} :Props) => {
  const dispatch = useDispatch();
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
      columnInfo,
      inputState,
      metadata,
      property,
    }));
  };

  return (
    <Modal
        isVisible={isVisible}
        onClose={onClose}
        textPrimary="Save Changes"
        textSecondary="Cancel"
        onClickPrimary={handleSubmit}
        textTitle="Edit Property">
      <EditMetadataBody inputState={inputState} onChange={handleChangeInputs} />
    </Modal>
  );
};

EditMetadataModal.defaultProps = {
  metadata: Map(),
  columnInfo: []
};

export default EditMetadataModal;
