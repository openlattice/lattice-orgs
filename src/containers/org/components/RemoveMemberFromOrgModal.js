/*
 * @flow
 */

import React from 'react';

import { OrganizationsApiActions } from 'lattice-sagas';
import { ActionModal } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { ModalBodyWidthHack } from '../../../components';
import { resetRequestState } from '../../../core/redux/actions';
import { ORGANIZATIONS } from '../../../core/redux/constants';

const { REMOVE_MEMBER_FROM_ORGANIZATION, removeMemberFromOrganization } = OrganizationsApiActions;

type Props = {
  member :string;
  memberId :string;
  onClose :() => void;
  organizationId :UUID;
};

const RemoveMemberFromOrgModal = ({
  member,
  memberId,
  onClose,
  organizationId,
} :Props) => {

  const dispatch = useDispatch();
  const removeMemberRS :?RequestState = useRequestState([ORGANIZATIONS, REMOVE_MEMBER_FROM_ORGANIZATION]);

  const rsComponents = {
    [RequestStates.STANDBY]: (
      <>
        <ModalBodyWidthHack />
        <span>Are you sure you want to remove the following member from this organization?</span>
        <br />
        <span>{member}</span>
      </>
    ),
    [RequestStates.SUCCESS]: (
      <>
        <ModalBodyWidthHack />
        <span>Success!</span>
      </>
    ),
    [RequestStates.FAILURE]: (
      <>
        <ModalBodyWidthHack />
        <span>Failed to remove member. Please try again.</span>
      </>
    ),
  };

  const handleOnClickPrimary = () => {
    dispatch(
      removeMemberFromOrganization({
        memberId,
        organizationId,
      })
    );
  };

  const handleOnClose = () => {
    onClose();
    // the timeout avoids rendering the modal with new state before the transition animation finishes
    setTimeout(() => {
      dispatch(resetRequestState([REMOVE_MEMBER_FROM_ORGANIZATION]));
    }, 1000);
  };

  return (
    <ActionModal
        isVisible
        onClickPrimary={handleOnClickPrimary}
        onClose={handleOnClose}
        requestState={removeMemberRS}
        requestStateComponents={rsComponents}
        textTitle="Confirm Removal" />
  );
};

export default RemoveMemberFromOrgModal;
