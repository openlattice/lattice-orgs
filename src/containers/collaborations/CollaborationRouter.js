/*
 * @flow
 */

import React, { useEffect } from 'react';

import { CollaborationsApiActions } from 'lattice-sagas';
import { AppContentWrapper } from 'lattice-ui-kit';
import {
  ReduxUtils,
  useRequestState,
} from 'lattice-utils';
import { useDispatch } from 'react-redux';
import {
  Redirect,
  Route,
  Switch,
} from 'react-router';
import type { RequestState } from 'redux-reqseq';

import CollaborationContainer from './CollaborationContainer';
import CollaborationsContainer from './CollaborationsContainer';
import { clearCollaborations } from './actions';

import { COLLABORATIONS } from '../../common/constants';
import { BasicErrorComponent, Spinner } from '../../components';
import { resetRequestStates } from '../../core/redux/actions';
import { Routes } from '../../core/router';

const { GET_ALL_COLLABORATIONS, getAllCollaborations } = CollaborationsApiActions;

const {
  isFailure,
  isPending,
  isStandby,
} = ReduxUtils;

const CollaborationRouter = () => {

  const dispatch = useDispatch();

  const getAllCollaborationsRS :?RequestState = useRequestState([COLLABORATIONS, GET_ALL_COLLABORATIONS]);

  useEffect(() => {
    dispatch(getAllCollaborations());
    return () => {
      dispatch(resetRequestStates([GET_ALL_COLLABORATIONS]));
      dispatch(clearCollaborations());
    };
  }, [dispatch]);

  if (isStandby(getAllCollaborationsRS) || isPending(getAllCollaborationsRS)) {
    return (
      <AppContentWrapper>
        <Spinner />
      </AppContentWrapper>
    );
  }

  if (isFailure(getAllCollaborationsRS)) {
    return (
      <AppContentWrapper>
        <BasicErrorComponent>
          Failed to load collaborations. Please try again or contact support.
        </BasicErrorComponent>
      </AppContentWrapper>
    );
  }

  return (
    <Switch>
      <Route path={Routes.COLLABORATION} component={CollaborationContainer} />
      <Route path={Routes.COLLABORATIONS} component={CollaborationsContainer} />
      <Redirect to={Routes.COLLABORATIONS} />
    </Switch>
  );
};

export default CollaborationRouter;
