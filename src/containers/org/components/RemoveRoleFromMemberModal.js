/*
 * @flow
 */

import React from 'react';

import { OrganizationsApiActions } from 'lattice-sagas';
import { ActionModal } from 'lattice-ui-kit';
import { PersonUtils, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ModalBody } from '../../../components';
import { resetRequestState } from '../../../core/redux/actions';
import { ORGANIZATIONS } from '../../../core/redux/constants';
import { getUserProfileLabel } from '../../../utils/PersonUtils';

const { getUserId } = PersonUtils;

const { REMOVE_ROLE_FROM_MEMBER, removeRoleFromMember } = OrganizationsApiActions;

type Props = {
  isVisible :boolean;
  member :any;
  onClose :() => void;
  organizationId :UUID;
  roleId :UUID;
};

const RemoveRoleFromMemberModal = ({
  isVisible,
  member,
  onClose,
  organizationId,
  roleId,
} :Props) => {

  const dispatch = useDispatch();
  const removeRoleRS :?RequestState = useRequestState([ORGANIZATIONS, REMOVE_ROLE_FROM_MEMBER]);
  const memberLabel = getUserProfileLabel(member);
  const memberId = getUserId(member);

  const rsComponents = {
    [RequestStates.STANDBY]: (
      <ModalBody>
        <span>Are you sure you want to remove the following member from this role?</span>
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
        textTitle="Confirm Removal" />
  );
};

export default RemoveRoleFromMemberModal;
