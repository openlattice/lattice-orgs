// @flow
import React from 'react';

import { faTimes } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import {
  IconButton,
  // $FlowFixMe[missing-export]
  ListItem,
} from 'lattice-ui-kit';

import StyledListItemSecondaryAction from './styled/StyledListItemSecondaryAction';

import { getUserProfile } from '../../../utils';

const CloseIcon = () => <FontAwesomeIcon fixedWidth icon={faTimes} />;

type Props = {
  member :Map;
  onClick :(id :string) => void;
};

const AddMemberListItem = ({
  member,
  onClick,
  ...rest
} :Props) => {
  const { name, email, id } = getUserProfile(member);

  const handleClick = () => {
    onClick(id);
  };

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <ListItem {...rest}>
      {name || email}
      <StyledListItemSecondaryAction>
        <IconButton aria-label="remove-member" onClick={handleClick}>
          <CloseIcon />
        </IconButton>
      </StyledListItemSecondaryAction>
    </ListItem>
  );
};

export default AddMemberListItem;
