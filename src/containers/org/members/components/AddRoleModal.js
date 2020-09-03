/*
 * @flow
 */

import React, { useMemo, useState } from 'react';

import { Set } from 'immutable';
import { ActionModal, Input, Label } from 'lattice-ui-kit';
import { LangUtils, Logger, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Organization, Role, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ModalBodyMinWidth } from '../../../../components';
import { resetRequestState } from '../../../../core/redux/actions';
import { ORGANIZATIONS } from '../../../../core/redux/constants';
import { ADD_ROLE_TO_ORGANIZATION, addRoleToOrganization } from '../../actions';

const { isNonEmptyString } = LangUtils;

const LOG = new Logger('AddRoleModal');

type Props = {
  isOwner :boolean;
  onClose :() => void;
  organization :Organization;
  organizationId :UUID;
};

const AddRoleModal = ({
  isOwner,
  onClose,
  organization,
  organizationId,
} :Props) => {

  const dispatch = useDispatch();

  const [isValidRoleTitle, setIsValidRoleTitle] = useState(true);
  const [roleDescription, setRoleDescription] = useState('');
  const [roleTitle, setRoleTitle] = useState('');

  const addRoleRS :?RequestState = useRequestState([ORGANIZATIONS, ADD_ROLE_TO_ORGANIZATION]);

  const roleTitlesSet :Set<string> = useMemo(() => (
    Set(organization.roles.map((role :Role) => role.title))
  ), [organization]);

  const handleOnChangeRoleTitle = (event :SyntheticInputEvent<HTMLInputElement>) => {
    const newRoleTitle = event.target.value || '';
    setRoleTitle(newRoleTitle);
    setIsValidRoleTitle(!roleTitlesSet.has(newRoleTitle));
  };

  const handleOnChangeRoleDescription = (event :SyntheticInputEvent<HTMLInputElement>) => {
    const newRoleDescription = event.target.value || '';
    setRoleDescription(newRoleDescription);
  };

  const handleOnClose = () => {
    onClose();
    // the timeout avoids rendering the modal with new state before the transition animation finishes
    setTimeout(() => {
      dispatch(resetRequestState([ADD_ROLE_TO_ORGANIZATION]));
    }, 1000);
  };

  const handleOnClickPrimary = () => {
    if (isOwner) {
      if (isNonEmptyString(roleTitle) && !roleTitlesSet.has(roleTitle)) {
        dispatch(
          addRoleToOrganization({
            organizationId,
            roleDescription,
            roleTitle,
          })
        );
      }
      else {
        setIsValidRoleTitle(false);
      }
    }
    else {
      LOG.error('only owners can add roles to an organization');
    }
  };

  const rsComponents = {
    [RequestStates.STANDBY]: (
      <ModalBodyMinWidth>
        <Label htmlFor="new-role-title">Title</Label>
        <Input
            disabled={addRoleRS === RequestStates.PENDING}
            id="new-role-title"
            error={!isValidRoleTitle}
            onChange={handleOnChangeRoleTitle} />
        <Label htmlFor="new-role-description">Description</Label>
        <Input
            disabled={addRoleRS === RequestStates.PENDING}
            id="new-role-description"
            onChange={handleOnChangeRoleDescription} />
      </ModalBodyMinWidth>
    ),
  };

  return (
    <ActionModal
        isVisible
        onClickPrimary={handleOnClickPrimary}
        onClose={handleOnClose}
        requestState={addRoleRS}
        requestStateComponents={rsComponents}
        textPrimary="Add"
        textTitle="Add Role">
      <br />
    </ActionModal>
  );
};

export default AddRoleModal;
