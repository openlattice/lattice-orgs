/*
 * @flow
 */

import React from 'react';

import { faUserPlus } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import { Button, Card } from 'lattice-ui-kit';

import { SpaceBetweenCardSegment } from '../../../components';
import { PersonUtils } from '../../../utils';

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
        <Button
            color="success"
            disabled={!isOwner}
            onClick={handleOnClickAddMember}
            variant="text">
          <FontAwesomeIcon fixedWidth icon={faUserPlus} />
        </Button>
      </SpaceBetweenCardSegment>
    </Card>
  );
};

export default NonMemberCard;
