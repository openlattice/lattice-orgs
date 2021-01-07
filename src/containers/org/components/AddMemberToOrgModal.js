/*
 * @flow
 */

import React, { useState } from 'react';

import { Map, get } from 'immutable';
import { OrganizationsApiActions } from 'lattice-sagas';
import { ActionModal } from 'lattice-ui-kit';
import { LangUtils, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import AddMemberModalBody from './AddMemberModalBody';
import MemberSuccessBody from './MemberSuccessBody';

import { ModalBody } from '../../../components';
import { resetRequestState } from '../../../core/redux/actions';
import { ORGANIZATIONS } from '../../../core/redux/constants';
import type { ReactSelectOption } from '../../../types';

const { isNonEmptyString } = LangUtils;
const { ADD_MEMBER_TO_ORGANIZATION, addMemberToOrganization } = OrganizationsApiActions;

type Props = {
  isVisible :boolean;
  onClose :() => void;
  organizationId :UUID;
};

const AddMemberToOrgModal = ({
  isVisible,
  onClose,
  organizationId,
} :Props) => {

  const dispatch = useDispatch();
  const [selectedMember, setMember] = useState(Map());
  const requestState :?RequestState = useRequestState([ORGANIZATIONS, ADD_MEMBER_TO_ORGANIZATION]);

  const onChange = (option :?ReactSelectOption<Map>) => {
    setMember(option?.value || Map());
  };

  const rsComponents = {
    [RequestStates.STANDBY]: (
      <AddMemberModalBody onChange={onChange} />
    ),
    [RequestStates.SUCCESS]: (
      <MemberSuccessBody organizationId={organizationId} />
    ),
    [RequestStates.FAILURE]: (
      <ModalBody>
        <span>Failed to add member. Please try again.</span>
      </ModalBody>
    ),
  };

  const handleOnClickPrimary = () => {
    const userId = get(selectedMember, 'user_id');
    if (isNonEmptyString(userId)) {
      dispatch(
        addMemberToOrganization({
          memberId: userId,
          organizationId,
          profile: selectedMember
        })
      );
    }
  };

  const handleOnClose = () => {
    onClose();
    // the timeout avoids rendering the modal with new state before the transition animation finishes
    setTimeout(() => {
      dispatch(resetRequestState([ADD_MEMBER_TO_ORGANIZATION]));
    }, 1000);
  };

  return (
    <ActionModal
        isVisible={isVisible}
        onClickPrimary={handleOnClickPrimary}
        onClose={handleOnClose}
        requestState={requestState}
        requestStateComponents={rsComponents}
        textTitle="Add Member"
        viewportScrolling />
  );
};

export default AddMemberToOrgModal;
