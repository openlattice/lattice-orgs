/*
 * @flow
 */

import React from 'react';

import { OrganizationsApiActions } from 'lattice-sagas';
import { ActionModal } from 'lattice-ui-kit';
import { PersonUtils, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { Role, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ModalBody } from '../../../components';
import { resetRequestState } from '../../../core/redux/actions';
import { ORGANIZATIONS } from '../../../core/redux/constants';
import { getUserTitle } from '../../../utils';

const { getUserId } = PersonUtils;

const { REMOVE_ROLE_FROM_MEMBER, removeRoleFromMember } = OrganizationsApiActions;

type Props = {
  isVisible :boolean;
  member :any;
  onClose :() => void;
  organizationId :UUID;
  role :?Role;
};

const RemoveRoleFromMemberModal = ({
  isVisible,
  member,
  onClose,
  organizationId,
  role,
} :Props) => {

  const dispatch = useDispatch();
  const removeRoleRS :?RequestState = useRequestState([ORGANIZATIONS, REMOVE_ROLE_FROM_MEMBER]);
  const memberLabel = getUserTitle(member);
  const memberId = getUserId(member);
  const roleId :UUID = role?.id || '';
  const roleTitle :string = role?.title || '';

  const rsComponents = {
    [RequestStates.STANDBY]: (
      <ModalBody>
        <span>Are you sure you want to unassign this role from the following member?</span>
        <br />
        <span>{memberLabel}</span>
      </ModalBody>
    ),
    [RequestStates.SUCCESS]: (
      <ModalBody>
        <span>Success!</span>
      </ModalBody>
    ),
    [RequestStates.FAILURE]: (
      <ModalBody>
        <span>Failed to remove role. Please try again.</span>
      </ModalBody>
    ),
  };

  const handleOnClickPrimary = () => {
    dispatch(
      removeRoleFromMember({
        memberId,
        organizationId,
        roleId,
      })
    );
  };

  const handleOnClose = () => {
    onClose();
    // the timeout avoids rendering the modal with new state before the transition animation finishes
    setTimeout(() => {
      dispatch(resetRequestState([REMOVE_ROLE_FROM_MEMBER]));
    }, 1000);
  };

  return (
    <ActionModal
        isVisible={isVisible}
        onClickPrimary={handleOnClickPrimary}
        onClose={handleOnClose}
        requestState={removeRoleRS}
        requestStateComponents={rsComponents}
        textTitle={`Unassign Role: ${roleTitle}`} />
  );
};

export default RemoveRoleFromMemberModal;
