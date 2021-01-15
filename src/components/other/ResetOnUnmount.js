/*
 * @flow
 */

import { useEffect } from 'react';

import { useDispatch } from 'react-redux';

import { resetRequestState } from '../../core/redux/actions';

// TODO: remove src/containers/org/components/ResetOnUnmount in favor of this component
const ResetOnUnmount = ({
  children,
  paths,
} :{
  children :any;
  paths :string[][];
}) => {

  const dispatch = useDispatch();

  useEffect(() => () => {
    paths.forEach((path) => {
      dispatch(resetRequestState(path));
    });
  }, [dispatch, paths]);

  return children;
};

export default ResetOnUnmount;
