/*
 * @flow
 */

import React, { useState } from 'react';

import styled from 'styled-components';
import { ActionModal, Input, Label } from 'lattice-ui-kit';
import { LangUtils, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import { resetRequestState } from '../../../core/redux/actions';
import { ORGANIZATIONS } from '../../../core/redux/constants';
import { CREATE_NEW_ORGANIZATION, createNewOrganization } from '../actions';

const { isNonEmptyString } = LangUtils;

const BodyGrid = styled.div`
  display: grid;
  grid-gap: 16px;
`;

type Props = {
  onClose :() => void;
};

const CreateOrgModal = ({ onClose } :Props) => {

  const dispatch = useDispatch();

  const [isValidOrgTitle, setIsValidOrgTitle] = useState(true);
  const [orgTitle, setOrgTitle] = useState('');
  const [orgDescription, setOrgDescription] = useState('');

  const createOrganizationRS :?RequestState = useRequestState([ORGANIZATIONS, CREATE_NEW_ORGANIZATION]);

  const handleOnClickPrimary = () => {
    if (isNonEmptyString(orgTitle)) {
      dispatch(
        createNewOrganization({
          description: orgDescription,
          title: orgTitle,
        })
      );
    }
    else {
      setIsValidOrgTitle(false);
    }
  };

  const handleOnChangeOrgTitle = (event :SyntheticInputEvent<HTMLInputElement>) => {
    setOrgTitle(event.target.value || '');
    setIsValidOrgTitle(true);
  };

  const handleOnChangeOrgDescription = (event :SyntheticInputEvent<HTMLInputElement>) => {
    setOrgDescription(event.target.value || '');
  };

  const handleOnClose = () => {
    onClose();
    setTimeout(() => {
      dispatch(resetRequestState([CREATE_NEW_ORGANIZATION]));
    }, 1000);
  };

  const rsComponents = {
    [RequestStates.STANDBY]: (
      <BodyGrid>
        <span>Enter a title for this organization and an optional description.</span>
        <div>
          <Label htmlFor="new-org-title">Title</Label>
          <Input error={!isValidOrgTitle} onChange={handleOnChangeOrgTitle} />
        </div>
        <div>
          <Label htmlFor="new-org-description">Description</Label>
          <Input onChange={handleOnChangeOrgDescription} />
        </div>
      </BodyGrid>
    ),
    [RequestStates.SUCCESS]: (
      <span>Success!</span>
    ),
    [RequestStates.FAILURE]: (
      <span>Failed to create organization. Please try again.</span>
    ),
  };

  return (
    <ActionModal
        isVisible
        onClickPrimary={handleOnClickPrimary}
        onClose={handleOnClose}
        requestState={createOrganizationRS}
        requestStateComponents={rsComponents}
        textPrimary="Create"
        textTitle="New Organization" />
  );
};

export default CreateOrgModal;
