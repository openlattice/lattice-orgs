/*
 * @flow
 */

import React, { useMemo, useState } from 'react';

import { Map } from 'immutable';
import {
  ActionModal,
  Input,
  Label,
  Select
} from 'lattice-ui-kit';
import {
  LangUtils,
  useRequestState,
} from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ModalBody, StackGrid } from '../../../components';
import { resetRequestStates } from '../../../core/redux/actions';
import { COLLABORATIONS } from '../../../core/redux/constants';
import { selectOrganizations } from '../../../core/redux/selectors';
import { CREATE_NEW_COLLABORATION, createNewCollaboration } from '../actions';
import type { ReactSelectOption } from '../../../types';

const { isNonEmptyString } = LangUtils;

type Props = {
  onClose :() => void;
};

const CreateCollaborationModal = ({ onClose } :Props) => {

  const dispatch = useDispatch();

  const [isValidCollaborationTitle, setIsValidCollaborationTitle] = useState(true);
  const [isValidCollaborationName, setIsValidCollaborationName] = useState(true);
  const [collaborationTitle, setCollaborationTitle] = useState('');
  const [collaborationName, setCollaborationName] = useState('');
  const [collaborationDescription, setCollaborationDescription] = useState('');
  const [collaborationOrganizations, setCollaborationOrganizations] = useState([]);

  const organizations :Map<UUID, Organization> = useSelector(selectOrganizations());
  const createNewCollaborationRS :?RequestState = useRequestState([COLLABORATIONS, CREATE_NEW_COLLABORATION]);

  const options = useMemo(() => {
    const selectOptions = [];
    organizations.forEach((org) => {
      selectOptions.push({
        label: org.title,
        value: org.id,
      });
    });

    return selectOptions;
  }, [organizations]);

  const handleOnChange = (orgOptions :?ReactSelectOption<Organization>[]) => {
    const orgIds = orgOptions.map((org) => org.value);
    setCollaborationOrganizations(orgIds);
  };

  const handleOnClickPrimary = () => {
    if (isNonEmptyString(collaborationTitle)) {
      dispatch(
        createNewCollaboration({
          description: collaborationDescription,
          name: collaborationName,
          organizationIds: collaborationOrganizations,
          title: collaborationTitle,
        })
      );
    }
    else {
      setIsValidCollaborationTitle(false);
    }
  };

  const handleOnChangeCollaborationTitle = (event :SyntheticInputEvent<HTMLInputElement>) => {
    setCollaborationTitle(event.target.value || '');
    setIsValidCollaborationTitle(true);
  };

  const handleOnChangeCollaborationName = (event :SyntheticInputEvent<HTMLInputElement>) => {
    setCollaborationName(event.target.value || '');
    setIsValidCollaborationName(true);
  };

  const handleOnChangeCollaborationDescription = (event :SyntheticInputEvent<HTMLInputElement>) => {
    setCollaborationDescription(event.target.value || '');
  };

  const handleOnClose = () => {
    onClose();
    setTimeout(() => {
      dispatch(resetRequestStates([CREATE_NEW_COLLABORATION]));
    }, 1000);
  };

  const rsComponents = {
    [RequestStates.STANDBY]: (
      <ModalBody>
        <StackGrid>
          <span>Enter a title for this collaboration and an optional description.</span>
          <div>
            <Label htmlFor="new-collaboration-title">Title</Label>
            <Input
                id="new-collaboration-title"
                error={!isValidCollaborationTitle}
                onChange={handleOnChangeCollaborationTitle} />
          </div>
          <div>
            <Label htmlFor="new-collaboration-name">Name</Label>
            <Input
                id="new-collaboration-name"
                error={!isValidCollaborationName}
                onChange={handleOnChangeCollaborationName} />
          </div>
          <div>
            <Label htmlFor="new-collaboration-description">Description</Label>
            <Input
                id="new-collaboration-description"
                onChange={handleOnChangeCollaborationDescription} />
          </div>
          <div>
            <Label htmlFor="new-collaboration-organizations">Select organizations to add to collaboration</Label>
            <Select
                id="new-collaboration-organizations"
                isMulti
                onChange={handleOnChange}
                options={options}
                placeholder="select organizations" />
          </div>
        </StackGrid>
      </ModalBody>
    ),
    [RequestStates.SUCCESS]: (
      <ModalBody>
        <span>Success!</span>
      </ModalBody>
    ),
    [RequestStates.FAILURE]: (
      <ModalBody>
        <span>Failed to create collaboration. Please try again.</span>
      </ModalBody>
    ),
  };

  return (
    <ActionModal
        isVisible
        onClickPrimary={handleOnClickPrimary}
        onClose={handleOnClose}
        requestState={createNewCollaborationRS}
        requestStateComponents={rsComponents}
        textPrimary="Create"
        textTitle="New Collaboration" />
  );
};

export default CreateCollaborationModal;
