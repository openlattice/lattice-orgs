// @flow
import React from 'react';

import {
  Input,
  Label,
  Typography,
} from 'lattice-ui-kit';

import { ModalBody, StackGrid } from '../../../components';

type Props = {
  inputState :Object;
  onChange :any;
};

const EditMetadataBody = ({ inputState, onChange } :Props) => {

  return (
    <ModalBody>
      <Typography gutterBottom>Update the title and description of the following property</Typography>
      <StackGrid>
        <div>
          <Label htmlFor="title-input" subtle>Title</Label>
          <Input
              id="title-input"
              name="title"
              onChange={onChange}
              value={inputState.title} />
        </div>
        <div>
          <Label htmlFor="description-input" subtle>Description</Label>
          <Input
              id="description-input"
              name="description"
              onChange={onChange}
              value={inputState.description} />
        </div>
      </StackGrid>
    </ModalBody>
  );
};

export default EditMetadataBody;
