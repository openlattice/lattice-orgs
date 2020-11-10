/*
 * @flow
 */

import { useReducer } from 'react';

const STEP_BACK :'STEP_BACK' = 'STEP_BACK';
const STEP_NEXT :'STEP_NEXT' = 'STEP_NEXT';

const INITIAL_STATE = {
  step: 0,
};

const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case STEP_BACK: {
      const step = state.step - 1;
      return {
        step: step < 0 ? 0 : step,
      };
    }
    case STEP_NEXT: {
      return {
        step: state.step + 1,
      };
    }
    default:
      return state;
  }
};

const StepsController = ({
  children,
} :{
  children :any;
}) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  return children({
    step: state.step,
    stepBack: () => dispatch({ type: STEP_BACK }),
    stepNext: () => dispatch({ type: STEP_NEXT }),
  });
};

export default StepsController;
