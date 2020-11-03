/*
 * @flow
 */

import React, { useEffect } from 'react';

import { Typography } from 'lattice-ui-kit';
import { useDispatch } from 'react-redux';

import { ModalBody } from '../../components';
import { resetRequestState } from '../../core/redux/actions';

type Props = {
  message :string;
  path :string[]
};

const ResetOnUnmount = ({ message, path } :Props) => {
  const dispatch = useDispatch();

  useEffect(() => () => {
    dispatch(resetRequestState(path));
  }, [dispatch, path]);

  return (
    <ModalBody>
      <Typography component="span">{message}</Typography>
    </ModalBody>
  );
};

export default ResetOnUnmount;
