/*
 * @flow
 */

import React, { useCallback } from 'react';

import { Map } from 'immutable';
import { Types } from 'lattice';
import type { ActionType } from 'lattice';

import { CompactCardSegment, MinusButton, PlusButton } from '../../../components';
import { PersonUtils } from '../../../utils';

const { ActionTypes } = Types;
const { getUserId, getUserProfileLabel } = PersonUtils;

type Props = {
  action :ActionType;
  isOwner :boolean;
  onClick :(userId :string) => void;
  user :Map | Object;
};

const UserCardSegment = ({
  action,
  isOwner,
  onClick,
  user,
} :Props) => {

  const userId :string = getUserId(user);
  const userProfileLabel :string = getUserProfileLabel(user) || userId;

  const handleOnClick = useCallback(() => {
    onClick(userId);
  }, [onClick, userId]);

  if (action === ActionTypes.ADD) {
    return (
      <CompactCardSegment key={userId} vertical={false}>
        <span title={userProfileLabel}>{userProfileLabel}</span>
        <PlusButton
            disabled={!isOwner}
            data-user-id={userId}
            onClick={handleOnClick} />
      </CompactCardSegment>
    );
  }

  if (action === ActionTypes.REMOVE) {
    return (
      <CompactCardSegment key={userId} vertical={false}>
        <span title={userProfileLabel}>{userProfileLabel}</span>
        <MinusButton
            disabled={!isOwner}
            data-user-id={userId}
            onClick={handleOnClick} />
      </CompactCardSegment>
    );
  }

  return null;
};

export default UserCardSegment;
