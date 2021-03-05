/*
 * @flow
 */

import Immutable from 'immutable';
import createSagaMiddleware from '@redux-saga/core';
import { routerMiddleware } from 'connected-react-router/immutable';
import { applyMiddleware, compose, createStore } from 'redux';

import reduxReducer from './ReduxReducer';

import sagas from '../sagas/Sagas';

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
    .setIn(['edm', 'entityTypes'], 'HIDDEN')
    .setIn(['edm', 'entityTypesIndexMap'], 'HIDDEN')
    .setIn(['edm', 'propertyTypes'], 'HIDDEN')
    .setIn(['edm', 'propertyTypesIndexMap'], 'HIDDEN');

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
