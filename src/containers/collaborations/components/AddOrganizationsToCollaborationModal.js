/*
 * @flow
 */

import React, { useMemo, useState } from 'react';

import { List, Map } from 'immutable';
import { CollaborationsApiActions } from 'lattice-sagas';
import { ActionModal, Label, Select } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ModalBody, ResetOnUnmount, StackGrid } from '../../../components';
import { COLLABORATIONS } from '../../../core/redux/constants';
import { selectOrganizations } from '../../../core/redux/selectors';
import type { ReactSelectOption } from '../../../types';

const { ADD_ORGANIZATIONS_TO_COLLABORATION, addOrganizationsToCollaboration } = CollaborationsApiActions;

const RESET_ACTIONS = [ADD_ORGANIZATIONS_TO_COLLABORATION];

const AddOrganizationsToCollaborationModal = ({
  collaborationId,
  isVisible,
  onClose,
  participatingOrganizations
} :{
  collaborationId :UUID;
  isVisible :boolean;
  onClose :() => void;
  participatingOrganizations :List;
}) => {

  const dispatch = useDispatch();

  const [collaborationOrganizations, setCollaborationOrganizations] = useState([]);

  const organizations :Map<UUID, Organization> = useSelector(selectOrganizations());
  const addOrgsToCollaborationRS :?RequestState = useRequestState([COLLABORATIONS, ADD_ORGANIZATIONS_TO_COLLABORATION]);

  const options = useMemo(() => {
    const selectOptions = [];
    organizations.forEach((org) => {
      if (!participatingOrganizations.includes(org.id)) {
        selectOptions.push({
          key: org.id,
          label: org.title,
          value: org.id,
        });
      }
    });

    return selectOptions;
  }, [organizations, participatingOrganizations]);

  const handleOnChange = (orgOptions :ReactSelectOption<Organization>[]) => {
    const orgIds = orgOptions.map((org) => org.value);
    setCollaborationOrganizations(orgIds);
  };

  const handleOnClickPrimary = () => {
    dispatch(
      addOrganizationsToCollaboration({
        collaborationId,
        organizationIds: collaborationOrganizations
      })
    );
  };

  const modalText = options.length
    ? 'Select organizations to add to collaboration.'
    : 'There are no eligible organizations to add to this collaboration.';

  const rsComponents = {
    [RequestStates.STANDBY]: (
      <ModalBody>
        <StackGrid>
          <Label htmlFor="add-organizations-to-collabroation">{modalText}</Label>
          <Select
              id="add-organizations-to-collabroation"
              isDisabled={!options.length}
              isMulti
              menuPortalTarget={document.body}
              styles={{ menuPortal: (provided) => ({ ...provided, zIndex: 9999 }) }}
              onChange={handleOnChange}
              options={options}
              placeholder="select organizations" />
        </StackGrid>
      </ModalBody>
    ),
    [RequestStates.SUCCESS]: (
      <ModalBody>
        <ResetOnUnmount actions={RESET_ACTIONS}>
          <span>Collaborations successfully added to collaboration!</span>
        </ResetOnUnmount>
      </ModalBody>
    ),
    [RequestStates.FAILURE]: (
      <ModalBody>
        <ResetOnUnmount actions={RESET_ACTIONS}>
          <span>Failed to add organizations to collaboration. Please try again.</span>
        </ResetOnUnmount>
      </ModalBody>
    ),
  };

  return (
    <ActionModal
        isVisible={isVisible}
        isDisabledPrimary={!options.length}
        onClickPrimary={options.length ? handleOnClickPrimary : null}
        onClickSecondary={onClose}
        onClose={onClose}
        requestState={addOrgsToCollaborationRS}
        requestStateComponents={rsComponents}
        textPrimary={options.length ? 'Add Organization(s)' : null}
        textSecondary="Cancel"
        textTitle="Add Organization(s)" />
  );
};

export default AddOrganizationsToCollaborationModal;
