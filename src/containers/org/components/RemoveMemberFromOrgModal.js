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

import ResetOnUnmount from './ResetOnUnmount';

import { ModalBody } from '../../../components';
import { ORGANIZATIONS } from '../../../core/redux/constants';
import { getUserTitle } from '../../../utils';

const { getUserId } = PersonUtils;

const { REMOVE_MEMBER_FROM_ORGANIZATION, removeMemberFromOrganization } = OrganizationsApiActions;

const resetStatePath = [REMOVE_MEMBER_FROM_ORGANIZATION];

type Props = {
  isVisible :boolean;
  member :any;
  onClose :() => void;
  organizationId :UUID;
};

const RemoveMemberFromOrgModal = ({
  isVisible,
  member,
  onClose,
  organizationId,
} :Props) => {

  const dispatch = useDispatch();
  const removeMemberRS :?RequestState = useRequestState([ORGANIZATIONS, REMOVE_MEMBER_FROM_ORGANIZATION]);
  const memberLabel = getUserTitle(member);
  const memberId = getUserId(member);

  const rsComponents = {
    [RequestStates.STANDBY]: (
      <ModalBody>
        <span>{`Are you sure you want to remove ${memberLabel} from this organization?`}</span>
      </ModalBody>
    ),
    [RequestStates.SUCCESS]: (
      <ResetOnUnmount path={resetStatePath} message="Success!" />
    ),
    [RequestStates.FAILURE]: (
      <ResetOnUnmount path={resetStatePath} message="Failed to remove member. Please try again." />
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

  return (
    <ActionModal
        isVisible={isVisible}
        onClickPrimary={handleOnClickPrimary}
        onClose={onClose}
        requestState={removeMemberRS}
        requestStateComponents={rsComponents}
        textTitle="Delete Person" />
  );
};

export default RemoveMemberFromOrgModal;
