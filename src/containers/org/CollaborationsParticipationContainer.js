// @flow
import React, { useState } from 'react';

import debounce from 'lodash/debounce';
import styled from 'styled-components';
import { List } from 'immutable';
import { SearchInput, Typography } from 'lattice-ui-kit';

import { World2Icon } from '../../assets';
import { BasicListCard, StackGrid } from '../../components';
import { COLLABORATION, COLLABORATION_ID_PARAM } from '../../core/router/Routes';

const IconWrapper = styled.span`
  display: inline-flex;
  margin-right: 16px;
`;

type Props = {
  collaborations :List;
  type :string;
};

const CollaborationsParticipationContainer = ({ collaborations, type } :Props) => {

  const [filterQuery, setFilterQuery] = useState('');

  const debounceSetSearchTerm = debounce((value) => {
    setFilterQuery(value);
  }, 250);

  const onSearchInputChange = (event :SyntheticEvent<HTMLInputElement>) => {
    debounceSetSearchTerm(event.currentTarget.value);
  };

  let filteredCollaborations = collaborations;
  if (filterQuery) {
    filteredCollaborations = filteredCollaborations
      .filter((collaboration) => collaboration.get('title').toLowerCase().includes(filterQuery.toLowerCase()));
  }

  const FilteredCollaborations = filteredCollaborations.size
    ? (
      <StackGrid gap={8}>
        {
          filteredCollaborations.map((collaboration) => {
            const id = collaboration.get('id');
            const title = collaboration.get('title');
            const collabPath = COLLABORATION.replace(COLLABORATION_ID_PARAM, id);

            return (
              <BasicListCard as="a" key={id} href={`#${collabPath}`}>
                <IconWrapper>
                  <World2Icon />
                </IconWrapper>
                {title}
              </BasicListCard>
            );
          })
        }
      </StackGrid>
    )
    : <Typography align="center">No collaborations matching filter.</Typography>;

  const showFilteredResults = !!collaborations.size;
  return (
    <StackGrid gap={24}>
      <SearchInput aria-label="filter collaborations input" onChange={onSearchInputChange} />
      {
        !showFilteredResults && (
          <Typography align="center">{`This ${type} is not part of any collaborations.`}</Typography>
        )
      }
      {
        showFilteredResults && FilteredCollaborations
      }
    </StackGrid>
  );
};

export default CollaborationsParticipationContainer;
