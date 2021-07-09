/*
 * @flow
 */

import Immutable from 'immutable';
import createSagaMiddleware from '@redux-saga/core';
import { routerMiddleware } from 'connected-react-router/immutable';
import { applyMiddleware, compose, createStore } from 'redux';

import reduxReducer from './ReduxReducer';

import {
  EDM,
  ENTITY_TYPES,
  ENTITY_TYPES_INDEX_MAP,
  PROPERTY_TYPES,
  PROPERTY_TYPES_INDEX_MAP
} from './constants';

import sagas from '../sagas/Sagas';

const HIDDEN = 'HIDDEN';

declare var __ENV_DEV__ :boolean;

export default function initializeReduxStore(routerHistory :any) :Object {

  const sagaMiddleware = createSagaMiddleware();

  const reduxMiddlewares = [
    sagaMiddleware,
    routerMiddleware(routerHistory)
  ];

  const reduxEnhancers = [
    applyMiddleware(...reduxMiddlewares)
  ];

  const stateSanitizer = (state) => state
    .setIn([EDM, ENTITY_TYPES], HIDDEN)
    .setIn([EDM, ENTITY_TYPES_INDEX_MAP], HIDDEN)
    .setIn([EDM, PROPERTY_TYPES], HIDDEN)
    .setIn([EDM, PROPERTY_TYPES_INDEX_MAP], HIDDEN);

  /* eslint-disable no-underscore-dangle */
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      maxAge: 100,
      name: __ENV_DEV__ ? 'localhost-orgs' : 'orgs',
      serialize: true,
      stateSanitizer,
    })
    : compose;
  /* eslint-enable */

  const reduxStore = createStore(
    reduxReducer(routerHistory),
    Immutable.Map(),
    composeEnhancers(...reduxEnhancers)
  );

  sagaMiddleware.run(sagas);

  return reduxStore;
}
