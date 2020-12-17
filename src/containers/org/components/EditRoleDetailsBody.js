// @flow
import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import {
  Button,
  Input,
  Typography,
} from 'lattice-ui-kit';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Organization, Role } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ModalBody, StackGrid } from '../../../components';
import { resetRequestState } from '../../../core/redux/actions';
import { EDIT_ROLE_DETAILS, editRoleDetails } from '../actions';

const StyledBody = styled(ModalBody)`
  padding-bottom: 30px;
`;

const StyledStack = styled(StackGrid)`
  margin: 16px 0 32px 0;
`;

type Props = {
  organization :Organization;
  requestState :?RequestState;
  role :Role
}

const EditRoleDetailsBody = ({ organization, requestState, role } :Props) => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState(role.title);
  const [description, setDescription] = useState(role.description);

  useEffect(() => () => {
    dispatch(resetRequestState([EDIT_ROLE_DETAILS]));
  }, [dispatch]);

  const handleSubmit = (e :SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(editRoleDetails({
      title,
      description,
      organizationId: organization.id,
      roleId: role.id
    }));
  };

  return (
    <StyledBody>
      <Typography color="textSecondary">Enter the details and description for this role.</Typography>
      <form onSubmit={handleSubmit}>
        <StyledStack>
          <div>
            <Typography
                color="textSecondary"
                component="label"
                display="block"
                gutterBottom
                htmlFor="role-title"
                variant="subtitle1">
              Name*
            </Typography>
            <Input
                id="role-title"
                onChange={(e :SyntheticEvent<HTMLInputElement>) => setTitle(e.currentTarget.value)}
                required
                value={title} />
          </div>
          <div>
            <Typography
                color="textSecondary"
                component="label"
                display="block"
                gutterBottom
                htmlFor="role-description"
                variant="subtitle1">
              Description
            </Typography>
            <Input
                id="role-description"
                onChange={(e :SyntheticEvent<HTMLInputElement>) => setDescription(e.currentTarget.value)}
                value={description} />
          </div>
        </StyledStack>
        <Button
            color="primary"
            fullWidth
            isLoading={requestState === RequestStates.PENDING}
            type="submit">
          Save
        </Button>
      </form>
    </StyledBody>
  );
};

export default EditRoleDetailsBody;
