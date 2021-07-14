// @flow
import React, { useState } from 'react';

import debounce from 'lodash/debounce';
import styled from 'styled-components';
import { List } from 'immutable';
import { Colors, SearchInput, Typography } from 'lattice-ui-kit';

import { World2Icon } from '../../assets';

const { NEUTRAL } = Colors;

const BasicListCard = styled.div`
  align-items: center;
  background-color: ${NEUTRAL.N50};
  border-radius: 5px;
  display: flex;
  padding: 8px 16px;
`;

const BasicListCardWrapper = styled.div`
  margin: 16px 0;
  ${BasicListCard}:not(:last-child) {
    margin-bottom: 8px;
  }
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
      <BasicListCardWrapper>
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
      </BasicListCardWrapper>
    )
    : <Typography align="center">No collaborations matching filter.</Typography>;

  const showFilteredResults = !!collaborations.size;
  return (
    <div>
      <SearchInput onChange={onSearchInputChange} />
      <BasicListCardWrapper>
        {
          !showFilteredResults && (
            <Typography align="center">{`This ${type} is not part of any collaborations.`}</Typography>
          )
        }
        {
          showFilteredResults && FilteredCollaborations
        }
      </BasicListCardWrapper>
    </div>
  );
};

export default CollaborationsParticipationContainer;
