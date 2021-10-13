/*
 * @flow
 */

import React, { useReducer, useState } from 'react';

import { Map, get } from 'immutable';
import {
  AppContentWrapper,
  PaginationToolbar,
  SearchInput,
  Typography,
} from 'lattice-ui-kit';
import { ReduxUtils } from 'lattice-utils';
import { useSelector } from 'react-redux';
import type { UUID } from 'lattice';

import { CreateCollaborationModal } from './components';

import { FILTER, MAX_HITS_10, PAGE } from '../../common/constants';
import {
  ActionsGrid,
  PlusButton,
  SimpleCollaborationCard,
  StackGrid,
} from '../../components';
import { selectUsersCollaborations } from '../../core/redux/selectors';

const { pagination } = ReduxUtils;

const CollaborationsContainer = () => {

  const [isVisibleAddCollaborationModal, setIsVisibleCreateCollaborationModal] = useState(false);
  const [paginationState, paginationDispatch] = useReducer(pagination.reducer, pagination.INITIAL_STATE);
  const collaborations :Map<UUID, Map> = useSelector(selectUsersCollaborations());
  const filteredCollaborations = collaborations.filter((collaboration :Map, collaborationId :UUID) => (
    collaboration && (
      collaborationId.includes(paginationState.query)
      || get(collaboration, 'title', '').toLowerCase().includes(paginationState.query.toLowerCase())
    )
  ));
  const filteredCollaborationsCount = filteredCollaborations.count();
  const pageCollaborations :Map<UUID, Map> = filteredCollaborations.slice(
    paginationState.start,
    paginationState.start + MAX_HITS_10,
  );

  const handleOnChangeCollaborationFilter = (event :SyntheticInputEvent<HTMLInputElement>) => {
    paginationDispatch({ type: FILTER, query: event.target.value || '' });
  };

  const handleOnPageChange = ({ page, start }) => {
    paginationDispatch({ type: PAGE, page, start });
  };

  return (
    <>
      <AppContentWrapper>
        <StackGrid gap={32}>
          <StackGrid>
            <Typography variant="h1">Collaborations</Typography>
            <Typography>
              {
                'Collaborations are where you can view your partnerships and shared data '
                + 'with other organizations. Click on a collaboration to start managing the '
                + 'participating organizations or add data sets.'
              }
            </Typography>
          </StackGrid>
          <ActionsGrid>
            <SearchInput onChange={handleOnChangeCollaborationFilter} placeholder="Filter collaborations" />
            <PlusButton aria-label="create collaboration" onClick={() => setIsVisibleCreateCollaborationModal(true)}>
              <Typography component="span">Create Collaboration</Typography>
            </PlusButton>
          </ActionsGrid>
          <StackGrid gap={24}>
            <Typography variant="h2">My Collaborations</Typography>
            {
              pageCollaborations.isEmpty() && (
                <Typography>
                  You are currently not participating in any Collaborations.
                </Typography>
              )
            }
            {
              !pageCollaborations.isEmpty() && (
                <>
                  {
                    filteredCollaborationsCount > MAX_HITS_10 && (
                      <PaginationToolbar
                          count={filteredCollaborationsCount}
                          onPageChange={handleOnPageChange}
                          page={paginationState.page}
                          rowsPerPage={MAX_HITS_10} />
                    )
                  }
                  {
                    pageCollaborations.valueSeq().map((collaboration :Map) => (
                      <SimpleCollaborationCard key={collaboration.get('id')} collaboration={collaboration} />
                    ))
                  }
                </>
              )
            }
          </StackGrid>
        </StackGrid>
      </AppContentWrapper>
      {
        isVisibleAddCollaborationModal && (
          <CreateCollaborationModal onClose={() => setIsVisibleCreateCollaborationModal(false)} />
        )
      }
    </>
  );
};

export default CollaborationsContainer;
