/*
 * @flow
 */

import React from 'react';

import { OrganizationsApiActions, PrincipalsApiActions } from 'lattice-sagas';
import { ActionModal } from 'lattice-ui-kit';
import { PersonUtils, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import SearchMemberModalBody from './SearchMemberModalBody';

import { ModalBody } from '../../../components';
import { resetRequestState } from '../../../core/redux/actions';
import { USERS } from '../../../core/redux/constants';
import { getUserProfileLabel } from '../../../utils/PersonUtils';

const { SEARCH_ALL_USERS } = PrincipalsApiActions;
const { getUserId } = PersonUtils;

const { REMOVE_MEMBER_FROM_ORGANIZATION, removeMemberFromOrganization } = OrganizationsApiActions;

type Props = {
  isVisible :boolean;
  member :any;
  onClose :() => void;
  organizationId :UUID;
};

const AddMemberFromOrgModal = ({
  isVisible,
  member,
  onClose,
  organizationId,
} :Props) => {

  const dispatch = useDispatch();
  const requestState :?RequestState = useRequestState([USERS, SEARCH_ALL_USERS]);
  const memberLabel = getUserProfileLabel(member);
  const memberId = getUserId(member);

  const rsComponents = {
    [RequestStates.STANDBY]: (
      <SearchMemberModalBody />
    ),
    [RequestStates.SUCCESS]: (
      <ModalBody>
        <span>Success!</span>
      </ModalBody>
    ),
    [RequestStates.FAILURE]: (
      <ModalBody>
        <span>Failed to remove member. Please try again.</span>
      </ModalBody>
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
        isVisible={isVisible}
        onClickPrimary={handleOnClickPrimary}
        onClose={handleOnClose}
        requestState={requestState}
        requestStateComponents={rsComponents}
        textTitle="Add Member" />
  );
};

export default AddMemberFromOrgModal;
