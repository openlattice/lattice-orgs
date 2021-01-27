/*
 * @flow
 */

import React, { useCallback, useState } from 'react';

import styled from 'styled-components';
import { faTimes } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import {
  Checkbox,
  IconButton,
  List,
  ListItem,
  ModalFooter,
  Typography,
} from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import ListItemSecondaryAction from './styled/ListItemSecondaryAction';
import SearchMemberBar from './SearchMemberBar';

import { ModalBody } from '../../../components';
import { ORGANIZATIONS } from '../../../core/redux/constants';
import { getUserProfile } from '../../../utils';
import { addMembersToOrganization } from '../actions';
import type { ReactSelectOption } from '../../../types';

const CloseIcon = () => <FontAwesomeIcon fixedWidth icon={faTimes} />;
const StyledFooter = styled(ModalFooter)`
  padding: 16px 0 30px;
`;
type Props = {
  organizationId :UUID;
};

const AddMemberModalBody = ({ organizationId } :Props) => {
  const dispatch = useDispatch();
  const [selectedMembers, setMembers] = useState(Map());
  // const requestState :?RequestState = useRequestState([ORGANIZATIONS, ADD_MEMBER_TO_ORGANIZATION]);

  const handleChange = useCallback((option ?:ReactSelectOption<Map>) => {
    const { id } = getUserProfile(option?.value);
    if (id) {
      const newMembers = selectedMembers.set(id, option?.value);
      setMembers(newMembers);
    }
  }, [selectedMembers]);

  const handleOnClickPrimary = () => {
    dispatch(
      addMembersToOrganization({
        organizationId,
        members: selectedMembers
      })
    );
  };

  return (
    <>
      <ModalBody>
        <Typography>Search and select the people you wish to add to the organization</Typography>
        <SearchMemberBar onChange={handleChange} />
        <List>
          {
            selectedMembers.valueSeq().map((member, index) => {
              const { name, email, id } = getUserProfile(member);
              return (
                <ListItem divider={index !== selectedMembers.size - 1} key={id}>
                  {name || email}
                  <ListItemSecondaryAction>
                    <IconButton aria-label="remove-member"><CloseIcon /></IconButton>
                    {/* <Checkbox /> */}
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })
          }
        </List>
      </ModalBody>
      <StyledFooter
          isPrimaryDisabled={!selectedMembers.size}
          onClickPrimary={handleOnClickPrimary}
          shouldStretchButtons
          textPrimary="Add" />
    </>
  );
};

export default AddMemberModalBody;
