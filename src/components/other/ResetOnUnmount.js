/*
 * @flow
 */

import { useEffect } from 'react';

import { useDispatch } from 'react-redux';

import { resetRequestState } from '../../core/redux/actions';

type Props = {
  children :any;
  paths :string[][];
};

const ResetOnUnmount = ({ children, paths } :Props) => {

  const dispatch = useDispatch();

  useEffect(() => () => {
    paths.forEach((path) => {
      dispatch(resetRequestState(path));
    });
  }, [dispatch, paths]);

  return children;
};

export default ResetOnUnmount;
