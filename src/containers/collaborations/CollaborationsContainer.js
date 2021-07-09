/*
 * @flow
 */

import React, { useEffect, useReducer, useState } from 'react';

import { Map, get } from 'immutable';
import { CollaborationsApiActions } from 'lattice-sagas';
import {
  AppContentWrapper,
  PaginationToolbar,
  SearchInput,
  Typography,
} from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { CREATE_NEW_COLLABORATION } from './actions';
import { CreateCollaborationModal } from './components';

import {
  ActionsGrid,
  PlusButton,
  SimpleCollaborationCard,
  StackGrid,
} from '../../components';
import { COLLABORATIONS } from '../../core/redux/constants';
import {
  selectUsersCollaborations
} from '../../core/redux/selectors';
import {
  FILTER,
  INITIAL_PAGINATION_STATE,
  PAGE,
  paginationReducer,
} from '../../utils/stateReducers/pagination';

const { isStandby, isSuccess } = ReduxUtils;
const { GET_COLLABORATIONS, getCollaborations } = CollaborationsApiActions;

const MAX_PER_PAGE = 10;

const CollaborationsContainer = () => {

  const [isVisibleAddCollaborationModal, setIsVisibleCreateCollaborationModal] = useState(false);
  const [paginationState, paginationDispatch] = useReducer(paginationReducer, INITIAL_PAGINATION_STATE);
  const dispatch = useDispatch();
  const collaborations :Map<UUID, Map> = useSelector(selectUsersCollaborations());
  const filteredCollaborations = collaborations.filter((collaboration :Map, collaborationId :UUID) => (
    collaboration && (collaborationId.includes(paginationState.query)
      || get(collaboration, 'title', '').toLowerCase().includes(paginationState.query.toLowerCase()))
  ));
  const filteredCollaborationsCount = filteredCollaborations.count();
  const pageCollaborations :Map<UUID, Map> = filteredCollaborations.slice(
    paginationState.start,
    paginationState.start + MAX_PER_PAGE,
  );

  const handleOnChangeCollaborationFilter = (event :SyntheticInputEvent<HTMLInputElement>) => {
    paginationDispatch({ type: FILTER, query: event.target.value || '' });
  };

  const handleOnPageChange = ({ page, start }) => {
    paginationDispatch({ type: PAGE, page, start });
  };

  const createNewCollaborationsRS :?RequestState = useRequestState([COLLABORATIONS, CREATE_NEW_COLLABORATION]);
  const getCollaborationsRS :?RequestState = useRequestState([COLLABORATIONS, GET_COLLABORATIONS]);

  useEffect(() => {
    if (isStandby(getCollaborationsRS) || isSuccess(createNewCollaborationsRS)) {
      dispatch(getCollaborations());
    }
  }, [dispatch, getCollaborationsRS, createNewCollaborationsRS]);

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
                + 'participating organizations or add datasets.'
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
                    filteredCollaborationsCount > MAX_PER_PAGE && (
                      <PaginationToolbar
                          count={filteredCollaborationsCount}
                          onPageChange={handleOnPageChange}
                          page={paginationState.page}
                          rowsPerPage={MAX_PER_PAGE} />
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
