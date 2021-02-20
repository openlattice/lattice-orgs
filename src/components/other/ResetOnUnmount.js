/*
 * @flow
 */

import { useEffect } from 'react';

import { useDispatch } from 'react-redux';

import { resetRequestStates } from '../../core/redux/actions';

// TODO: remove src/containers/org/components/ResetOnUnmount in favor of this component
const ResetOnUnmount = ({
  actions,
  children,
} :{
  actions :string[];
  children :any;
}) => {

  const dispatch = useDispatch();

  useEffect(() => () => {
    dispatch(resetRequestStates(actions));
  }, [dispatch, actions]);

  return children;
};

export default ResetOnUnmount;
