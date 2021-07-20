// @flow
import React, { useState } from 'react';

import debounce from 'lodash/debounce';
import styled from 'styled-components';
import { List } from 'immutable';
import { Colors, SearchInput, Typography } from 'lattice-ui-kit';

import { World2Icon } from '../../assets';
import { StackGrid } from '../../components';

const { NEUTRAL } = Colors;

const BasicListCard = styled.div`
  align-items: center;
  background-color: ${NEUTRAL.N50};
  border-radius: 5px;
  display: flex;
  padding: 8px 16px;
`;

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

            return (
              <BasicListCard key={id}>
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
