/*
 * @flow
 */

import React, { useMemo, useReducer, useState } from 'react';

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

const INITIAL_STATE :{
  description :string;
  name :string;
  nameIsValid :boolean;
  title :string;
  titleIsValid :boolean;
} = {
  description: '',
  name: '',
  nameIsValid: true,
  title: '',
  titleIsValid: true,
};

const DESCRIPTION = 'DESCRIPTIOIN';
const NAME = 'NAME';
const TITLE = 'TITLE';
const NAME_IS_VALID = 'NAME_IS_VALID';
const TITLE_IS_VALID = 'TITLE_IS_VALID';

const reducer = (state, action) => {
  switch (action.type) {
    case DESCRIPTION:
      return {
        ...state,
        description: action.value,
      };
    case NAME:
      return {
        ...state,
        name: action.value,
      };
    case NAME_IS_VALID:
      return {
        ...state,
        nameIsValid: action.value,
      };
    case TITLE:
      return {
        ...state,
        title: action.value,
      };
    case TITLE_IS_VALID:
      return {
        ...state,
        titleIsValid: action.value,
      };
    default:
      return state;
  }
};

const CreateCollaborationModal = ({ onClose } :Props) => {

  const dispatch = useDispatch();

  const [modalState, modalDispatch] = useReducer(reducer, INITIAL_STATE);

  const [collaborationOrganizations, setCollaborationOrganizations] = useState([]);

  const organizations :Map<UUID, Organization> = useSelector(selectOrganizations());
  const createNewCollaborationRS :?RequestState = useRequestState([COLLABORATIONS, CREATE_NEW_COLLABORATION]);

  const options = useMemo(() => {
    const selectOptions = [];
    organizations.forEach((org) => {
      selectOptions.push({
        key: org.id,
        label: org.title,
        value: org.id,
      });
    });

    return selectOptions;
  }, [organizations]);

  const handleOnChange = (orgOptions :ReactSelectOption<Organization>[]) => {
    const orgIds = orgOptions.map((org) => org.value);
    setCollaborationOrganizations(orgIds);
  };

  const handleOnClickPrimary = () => {
    if (isNonEmptyString(modalState.name) && isNonEmptyString(modalState.title)) {
      dispatch(
        createNewCollaboration({
          description: modalState.description,
          name: modalState.name,
          organizationIds: collaborationOrganizations,
          title: modalState.title,
        })
      );
    }
    else {
      if (!isNonEmptyString(modalState.name)) {
        modalDispatch({ type: NAME_IS_VALID, value: false });
      }
      if (!isNonEmptyString(modalState.title)) {
        modalDispatch({ type: TITLE_IS_VALID, value: false });
      }
    }
  };

  const handleOnInputChange = (event :SyntheticInputEvent<HTMLInputElement>) => {
    switch (event.target.name) {
      case DESCRIPTION: {
        modalDispatch({ type: DESCRIPTION, value: event.target.value || '' });
        break;
      }
      case NAME: {
        modalDispatch({ type: NAME, value: event.target.value || '' });
        modalDispatch({ type: NAME_IS_VALID, value: true });
        break;
      }
      case TITLE: {
        modalDispatch({ type: TITLE, value: event.target.value || '' });
        modalDispatch({ type: TITLE_IS_VALID, value: true });
        break;
      }
      default: {
        break;
      }
    }
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
          <span>Enter a title, name, and optional description for this collaboration.</span>
          <div>
            <Label htmlFor="new-collaboration-title">Title</Label>
            <Input
                id="new-collaboration-title"
                error={!modalState.titleIsValid}
                name={TITLE}
                onChange={handleOnInputChange} />
          </div>
          <div>
            <Label htmlFor="new-collaboration-name">Name</Label>
            <Input
                id="new-collaboration-name"
                error={!modalState.nameIsValid}
                name={NAME}
                onChange={handleOnInputChange} />
          </div>
          <div>
            <Label htmlFor="new-collaboration-description">Description</Label>
            <Input
                id="new-collaboration-description"
                name={DESCRIPTION}
                onChange={handleOnInputChange} />
          </div>
          <div>
            <Label htmlFor="new-collaboration-organizations">Select organizations to add to collaboration</Label>
            <Select
                id="new-collaboration-organizations"
                isMulti
                menuPortalTarget={document.body}
                styles={{ menuPortal: (provided) => ({ ...provided, zIndex: 9999 }) }}
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
