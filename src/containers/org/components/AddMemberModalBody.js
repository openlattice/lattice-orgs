/*
 * @flow
 */

import React, { useCallback, useState } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import {
  IconButton,
  List as LUKList,
  ListItem,
  ModalFooter,
  Typography,
} from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import type { List } from 'immutable';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import AddMemberListItem from './AddMemberListItem';
import SearchMemberBar from './SearchMemberBar';

import { ModalBody } from '../../../components';
import { ORGANIZATIONS } from '../../../core/redux/constants';
import { getUserProfile } from '../../../utils';
import { ADD_MEMBERS_TO_ORGANIZATION, addMembersToOrganization } from '../actions';
import type { ReactSelectOption } from '../../../types';

const { isPending, isSuccess } = ReduxUtils;

const StyledFooter = styled(ModalFooter)`
  padding: 16px 0 30px;
`;

type Props = {
  members :List;
  organizationId :UUID;
};

const AddMemberModalBody = ({ members, organizationId } :Props) => {
  const dispatch = useDispatch();
  const [selectedMembers, setMembers] = useState(Map());
  const requestState :?RequestState = useRequestState([ORGANIZATIONS, ADD_MEMBERS_TO_ORGANIZATION]);

  const pending = isPending(requestState);
  const success = isSuccess(requestState);

  const handleChange = useCallback((option ?:ReactSelectOption<Map>) => {
    const { id } = getUserProfile(option?.value);
    if (id) {
      const newMembers = selectedMembers.set(id, option?.value);
      setMembers(newMembers);
    }
  }, [selectedMembers]);

  const handleRemoveMember = (id :string) => {
    const newMembers = selectedMembers.remove(id);
    setMembers(newMembers);
  };

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
        <SearchMemberBar existingMembers={members} onChange={handleChange} />
        <LUKList>
          {
            selectedMembers.valueSeq().map((member, index) => {
              const { id } = getUserProfile(member);
              return (
                <AddMemberListItem
                    disableGutters
                    divider={index !== selectedMembers.size - 1}
                    key={`member-${id}`}
                    member={member}
                    onClick={handleRemoveMember} />
              );
            })
          }
        </LUKList>
      </ModalBody>
      <StyledFooter
          isPendingPrimary={pending}
          isPrimaryDisabled={!selectedMembers.size}
          onClickPrimary={handleOnClickPrimary}
          shouldStretchButtons
          textPrimary="Add" />
    </>
  );
};

export default AddMemberModalBody;
