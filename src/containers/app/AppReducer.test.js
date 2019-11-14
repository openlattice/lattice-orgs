import { Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';

import reducer from './AppReducer';
import {
  INITIALIZE_APPLICATION,
  initializeApplication,
} from './AppActions';

describe('AppReducer', () => {

  const INITIAL_STATE = reducer(undefined, { type: '__TEST__' });

  test('INITIAL_STATE', () => {
    expect(INITIAL_STATE).toBeInstanceOf(Map);
    expect(INITIAL_STATE.getIn([INITIALIZE_APPLICATION, 'requestState'])).toEqual(RequestStates.STANDBY);
  });

  describe(INITIALIZE_APPLICATION, () => {

    test(initializeApplication.REQUEST, () => {

      const { id } = initializeApplication();
      const requestAction = initializeApplication.request(id);
      const state = reducer(INITIAL_STATE, requestAction);

      expect(state.getIn([INITIALIZE_APPLICATION, 'requestState'])).toEqual(RequestStates.PENDING);
      expect(state.getIn([INITIALIZE_APPLICATION, id])).toEqual(requestAction);
    });

    test(initializeApplication.SUCCESS, () => {

      const { id } = initializeApplication();
      const requestAction = initializeApplication.request(id);
      let state = reducer(INITIAL_STATE, requestAction);
      state = reducer(state, initializeApplication.success(id));

      expect(state.getIn([INITIALIZE_APPLICATION, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.getIn([INITIALIZE_APPLICATION, id])).toEqual(requestAction);
    });

    test(initializeApplication.FAILURE, () => {

      const { id } = initializeApplication();
      const requestAction = initializeApplication.request(id);
      let state = reducer(INITIAL_STATE, requestAction);
      state = reducer(state, initializeApplication.failure(id));

      expect(state.getIn([INITIALIZE_APPLICATION, 'requestState'])).toEqual(RequestStates.FAILURE);
      expect(state.getIn([INITIALIZE_APPLICATION, id])).toEqual(requestAction);
    });

    test(initializeApplication.FINALLY, () => {

      const { id } = initializeApplication();
      const requestAction = initializeApplication.request(id);
      let state = reducer(INITIAL_STATE, requestAction);

      state = reducer(state, initializeApplication.success(id));
      expect(state.getIn([INITIALIZE_APPLICATION, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.getIn([INITIALIZE_APPLICATION, id])).toEqual(requestAction);

      state = reducer(state, initializeApplication.finally(id));
      expect(state.getIn([INITIALIZE_APPLICATION, 'requestState'])).toEqual(RequestStates.SUCCESS);
      expect(state.hasIn([INITIALIZE_APPLICATION, id])).toEqual(false);
    });

  });

});
