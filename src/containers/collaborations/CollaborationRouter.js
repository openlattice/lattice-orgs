/*
 * @flow
 */

import React, { useEffect } from 'react';

import { CollaborationsApiActions } from 'lattice-sagas';
import { AppContentWrapper } from 'lattice-ui-kit';
import {
  Logger,
  ReduxUtils,
  RoutingUtils,
  ValidationUtils,
  useRequestState,
} from 'lattice-utils';
import { useDispatch } from 'react-redux';
import {
  Redirect,
  Route,
  Switch,
  useRouteMatch
} from 'react-router';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import CollaborationContainer from './CollaborationContainer';
import CollaborationsContainer from './CollaborationsContainer';
import { GET_DATA_SETS_IN_COLLABORATION, getDataSetsInCollaboration } from './actions';

import { BasicErrorComponent, Spinner } from '../../components';
import { COLLABORATIONS } from '../../core/redux/constants';
import { Routes } from '../../core/router';
import { ERR_INVALID_UUID } from '../../utils/constants/errors';

const { GET_ALL_COLLABORATIONS, getAllCollaborations } = CollaborationsApiActions;

const {
  isFailure,
  isPending,
  isStandby,
  isSuccess,
} = ReduxUtils;
const { getParamFromMatch } = RoutingUtils;
const { isValidUUID } = ValidationUtils;

const LOG = new Logger('CollaborationRouter');

const CollaborationRouter = () => {

  const dispatch = useDispatch();

  let collaborationId :?UUID;

  const matchCollaboration = useRouteMatch(Routes.COLLABORATION);

  // TODO: having to match each route is a pain. how do we avoid this pattern?
  if (matchCollaboration) {
    collaborationId = getParamFromMatch(matchCollaboration, Routes.COLLABORATION_ID_PARAM);
  }

  const getAllCollaborationsRS :?RequestState = useRequestState([COLLABORATIONS, GET_ALL_COLLABORATIONS]);
  const getDataSetsInCollaborationRS :?RequestState = useRequestState([COLLABORATIONS, GET_DATA_SETS_IN_COLLABORATION]);

  useEffect(() => {
    if (isStandby(getAllCollaborationsRS)) {
      dispatch(getAllCollaborations());
    }
  }, [dispatch, getAllCollaborationsRS]);

  useEffect(() => {
    if (isValidUUID(collaborationId)) {
      dispatch(getDataSetsInCollaboration(collaborationId));
    }
  }, [dispatch, collaborationId]);

  const collaborationsSpinner = isStandby(getAllCollaborationsRS) || isPending(getAllCollaborationsRS);
  const collaborationSpinner = isValidUUID(collaborationId) && isSuccess(getAllCollaborationsRS) && (
    isStandby(getDataSetsInCollaborationRS) || isPending(getDataSetsInCollaborationRS)
  );

  if (collaborationsSpinner || collaborationSpinner) {
    return (
      <AppContentWrapper>
        <Spinner />
      </AppContentWrapper>
    );
  }

  if (isFailure(getAllCollaborationsRS) || isFailure(getDataSetsInCollaborationRS)) {
    return (
      <AppContentWrapper>
        <BasicErrorComponent />
      </AppContentWrapper>
    );
  }

  if (isSuccess(getAllCollaborationsRS)) {

    const renderCollaborationContainer = () => (
      (collaborationId)
        ? <CollaborationContainer collaborationId={collaborationId} />
        : null
    );

    return (
      <Switch>
        <Route path={Routes.COLLABORATION} render={renderCollaborationContainer} />
        <Route path={Routes.COLLABORATIONS} component={CollaborationsContainer} />
        <Redirect to={Routes.COLLABORATIONS} />
      </Switch>
    );
  }

  if (!isValidUUID(collaborationId)) {
    LOG.error(ERR_INVALID_UUID, collaborationId);
  }

  return null;
};

export default CollaborationRouter;
