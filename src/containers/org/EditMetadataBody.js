// @flow
import React, { useState } from 'react';

import styled from 'styled-components';
import {
  Input,
  Label,
  Typography,
} from 'lattice-ui-kit';

import { ModalBody } from '../../components';

const FieldWrapper = styled.div`
  margin-bottom: 16px;
`;

type Props = {
  inputState :Object;
  onChange :any;
};

const EditMetadataBody = ({ inputState, onChange } :Props) => {

  return (
    <ModalBody>
      <Typography gutterBottom>Update the title and description of the following property</Typography>
      <FieldWrapper>
        <Label htmlFor="title-input" subtle>Title</Label>
        <Input
            id="title-input"
            name="title"
            onChange={onChange}
            value={inputState.title} />
      </FieldWrapper>
      <Label htmlFor="description-input" subtle>Description</Label>
      <Input
          id="description-input"
          name="description"
          onChange={onChange}
          value={inputState.description} />
    </ModalBody>
  );
};

export default EditMetadataBody;
