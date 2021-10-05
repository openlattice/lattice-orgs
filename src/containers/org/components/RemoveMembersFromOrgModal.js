/*
 * @flow
 */

import React from 'react';

import { Map } from 'immutable';
import { AuthUtils } from 'lattice-auth';
import { OrganizationsApiActions } from 'lattice-sagas';
import { ActionModal, Typography } from 'lattice-ui-kit';
import { PersonUtils, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { UserInfo } from 'lattice-auth';
import type { RequestState } from 'redux-reqseq';

import { ModalBody, ResetOnUnmount } from '../../../components';
import { ORGANIZATIONS } from '../../../core/redux/constants';
import { REMOVE_MEMBERS_FROM_ORGANIZATION, removeMembersFromOrganization } from '../actions';

const { getUserId } = PersonUtils;

const { REMOVE_MEMBER_FROM_ORGANIZATION } = OrganizationsApiActions;

const RESET_ACTIONS = [REMOVE_MEMBERS_FROM_ORGANIZATION, REMOVE_MEMBER_FROM_ORGANIZATION];

type Props = {
  isVisible :boolean;
  members :Map;
  onClose :() => void;
  organizationId :UUID;
};

const RemoveMembersFromOrgModal = ({
  isVisible,
  members,
  onClose,
  organizationId,
} :Props) => {

  const dispatch = useDispatch();
  const removeMemberRS :?RequestState = useRequestState([ORGANIZATIONS, REMOVE_MEMBERS_FROM_ORGANIZATION]);
  const thisUserInfo :?UserInfo = AuthUtils.getUserInfo();
  const yourMemberId = getUserId(thisUserInfo);
  const membersWithoutYou = members.delete(yourMemberId);
  const memberCount = membersWithoutYou.size;

  const rsComponents = {
    [RequestStates.STANDBY]: (
      <ModalBody>
        <Typography>
          {`Are you sure you want to remove ${memberCount} member(s) from this organization?
          You cannot remove yourself this way.`}
        </Typography>
      </ModalBody>
    ),
    [RequestStates.SUCCESS]: (
      <ResetOnUnmount actions={RESET_ACTIONS}>
        <Typography>Success!</Typography>
      </ResetOnUnmount>
    ),
    [RequestStates.FAILURE]: (
      <ResetOnUnmount actions={RESET_ACTIONS}>
        <Typography>Failed to remove members. Please try again.</Typography>
      </ResetOnUnmount>
    ),
  };

  const handleOnClickPrimary = () => {

    const memberIds = membersWithoutYou.keySeq().toJS();
    dispatch(
      removeMembersFromOrganization({
        memberIds,
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
        textTitle="Remove Members From Organization" />
  );
};

export default RemoveMembersFromOrgModal;
