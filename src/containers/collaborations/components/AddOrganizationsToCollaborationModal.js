/*
 * @flow
 */

import React, { useMemo, useState } from 'react';

import { List, Map } from 'immutable';
import { CollaborationsApiActions } from 'lattice-sagas';
import { ActionModal } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Organization, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import SelectOrganizationsToAddToCollaboration from './SelectOrganizationsToAddToCollaboration';
import { ModalBody, ResetOnUnmount } from '../../../components';
import { COLLABORATIONS } from '../../../core/redux/constants';
import { ORGANIZATION_IDS } from '../../../utils/constants';
import { selectCollaboration, selectOrganizations } from '../../../core/redux/selectors';

const { ADD_ORGANIZATIONS_TO_COLLABORATION, addOrganizationsToCollaboration } = CollaborationsApiActions;

const RESET_ACTIONS = [ADD_ORGANIZATIONS_TO_COLLABORATION];

const AddOrganizationsToCollaborationModal = ({
  collaborationId,
  isVisible,
  onClose
} :{
  collaborationId :UUID;
  isVisible :boolean;
  onClose :() => void;
}) => {

  const dispatch = useDispatch();

  const [collaborationOrganizations, setCollaborationOrganizations] = useState([]);

  const collaboration :Map<UUID, List<UUID>> = useSelector(selectCollaboration(collaborationId));
  const organizationIds :List<UUID> = collaboration.get(ORGANIZATION_IDS, List());
  const organizations :Map<UUID, Organization> = useSelector(selectOrganizations());
  const addOrgsToCollaborationRS :?RequestState = useRequestState([COLLABORATIONS, ADD_ORGANIZATIONS_TO_COLLABORATION]);

  const options = useMemo(() => {
    const selectOptions = [];
    organizations.forEach((org) => {
      if (!organizationIds.includes(org.id)) {
        selectOptions.push({
          key: org.id,
          label: org.title,
          value: org.id,
        });
      }
    });

    return selectOptions;
  }, [organizations, organizationIds]);

  const handleOnClickPrimary = () => {
    dispatch(
      addOrganizationsToCollaboration({
        collaborationId,
        organizationIds: collaborationOrganizations
      })
    );
  };

  const rsComponents = {
    [RequestStates.STANDBY]: (
      <SelectOrganizationsToAddToCollaboration
          collaborationId={collaborationId}
          options={options}
          setCollaborationOrganizations={setCollaborationOrganizations} />
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
