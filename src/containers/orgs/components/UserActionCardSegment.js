/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import { Button, CardSegment } from 'lattice-ui-kit';

import type { UserActionObject } from './types';

import { PersonUtils } from '../../../utils';

const { getUserId, getUserProfileLabel } = PersonUtils;

const StyledCardSegment = styled(CardSegment)`
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;

  > span {
    overflow: hidden;
    padding-right: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

type Props = {
  actions :Array<UserActionObject>;
  isOwner :boolean;
  user :Map | Object;
};

const UserActionCardSegment = ({
  actions,
  isOwner,
  user,
} :Props) => {

  const userId :string = getUserId(user);
  const userProfileLabel :string = getUserProfileLabel(user) || userId;

  const handleOnClick = (action :UserActionObject, event :SyntheticInputEvent<HTMLElement>) => {
    event.stopPropagation();
    if (isOwner) {
      action.onClick(userId);
    }
  };

  return (
    <StyledCardSegment key={userId} vertical={false}>
      <span title={userProfileLabel}>{userProfileLabel}</span>
      <div>
        {
          actions.map((action :Object) => (
            <Button
                color={action.color}
                disabled={!isOwner}
                key={userId}
                onClick={(e) => handleOnClick(action, e)}
                variant="text">
              <FontAwesomeIcon fixedWidth icon={action.faIcon} />
            </Button>
          ))
        }
      </div>
    </StyledCardSegment>
  );
};

export default UserActionCardSegment;
