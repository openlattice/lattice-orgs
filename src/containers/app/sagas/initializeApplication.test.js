/*
 * @flow
 */

import { all, call, put } from '@redux-saga/core/effects';
import { v4 as uuid } from 'uuid';

import { initializeApplicationWatcher, initializeApplicationWorker } from './initializeApplication';

import { GET_EDM_TYPES } from '../../../core/edm/actions';
import { getEntityDataModelTypesWorker } from '../../../core/edm/sagas';
import {
  GENERATOR_TAG,
  testShouldBeGeneratorFunction,
  testWatcherSagaShouldTakeEvery,
} from '../../../utils/testing/TestUtils';
import { GET_ORGANIZATIONS_AND_AUTHORIZATIONS } from '../../org/actions';
import { getOrganizationsAndAuthorizationsWorker } from '../../org/sagas';
import { INITIALIZE_APPLICATION, initializeApplication } from '../actions';

const MOCK_RESPONSE = { data: true };

describe('AppSagas', () => {

  describe('initializeApplicationWatcher', () => {
    testShouldBeGeneratorFunction(initializeApplicationWatcher);
    testWatcherSagaShouldTakeEvery(
      initializeApplicationWatcher,
      initializeApplicationWorker,
      INITIALIZE_APPLICATION,
    );
  });

  describe('initializeApplicationWorker', () => {

    testShouldBeGeneratorFunction(initializeApplicationWorker);

    test('success case', () => {

      const mockActionValue = uuid();
      const workerSagaAction = initializeApplication(mockActionValue);
      const iterator = initializeApplicationWorker(workerSagaAction);
      expect(Object.prototype.toString.call(iterator)).toEqual(GENERATOR_TAG);

      let step = iterator.next();
      expect(step.value).toEqual(
        put({
          id: workerSagaAction.id,
          type: initializeApplication.REQUEST,
          value: {},
        })
      );

      step = iterator.next();
      expect(step.value).toEqual(
        all([
          call(getEntityDataModelTypesWorker, {
            // $FlowIgnore
            id: expect.any(String),
            type: GET_EDM_TYPES,
            value: {},
          }),
          call(getOrganizationsAndAuthorizationsWorker, {
            // $FlowIgnore
            id: expect.any(String),
            type: GET_ORGANIZATIONS_AND_AUTHORIZATIONS,
            value: {},
          }),
        ])
      );

      step = iterator.next([MOCK_RESPONSE, MOCK_RESPONSE]);
      expect(step.value).toEqual(
        put({
          id: workerSagaAction.id,
          type: initializeApplication.SUCCESS,
          value: {},
        })
      );

      step = iterator.next();
      expect(step.value).toEqual(
        put({
          id: workerSagaAction.id,
          type: initializeApplication.FINALLY,
          value: {},
        })
      );

      step = iterator.next();
      expect(step.done).toEqual(true);
    });

    test('failure case', () => {

      const mockActionValue = uuid();
      const workerSagaAction = initializeApplication(mockActionValue);
      const iterator = initializeApplicationWorker(workerSagaAction);
      expect(Object.prototype.toString.call(iterator)).toEqual(GENERATOR_TAG);

      let step = iterator.next();
      expect(step.value).toEqual(
        put({
          id: workerSagaAction.id,
          type: initializeApplication.REQUEST,
          value: {},
        })
      );

      step = iterator.throw(new Error('fail'));
      expect(step.value).toEqual(
        put({
          id: workerSagaAction.id,
          type: initializeApplication.FAILURE,
          value: {},
        })
      );

      step = iterator.next();
      expect(step.value).toEqual(
        put({
          id: workerSagaAction.id,
          type: initializeApplication.FINALLY,
          value: {},
        })
      );

      step = iterator.next();
      expect(step.done).toEqual(true);
    });

  });

});
