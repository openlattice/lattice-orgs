/*
 * @flow
 */

import React from 'react';

import { faUserPlus } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import { Card, IconButton } from 'lattice-ui-kit';

import { SpaceBetweenCardSegment } from '../../../../components';
import { PersonUtils } from '../../../../utils';

const { getUserId, getUserProfileLabel } = PersonUtils;

type Props = {
  isOwner :boolean;
  member :Map;
  onClickAddMember :(member :Map) => void;
};

const NonMemberCard = ({
  isOwner,
  member,
  onClickAddMember,
} :Props) => {

  const userId :string = getUserId(member);
  const userProfileLabel :string = getUserProfileLabel(member) || userId;

  const handleOnClickAddMember = (event :SyntheticEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (isOwner) {
      onClickAddMember(member);
    }
  };

  return (
    <Card>
      <SpaceBetweenCardSegment vertical={false}>
        <span title={userProfileLabel}>{userProfileLabel}</span>
        <IconButton color="success" disabled={!isOwner} onClick={handleOnClickAddMember}>
          <FontAwesomeIcon fixedWidth icon={faUserPlus} />
        </IconButton>
      </SpaceBetweenCardSegment>
    </Card>
  );
};

export default NonMemberCard;
