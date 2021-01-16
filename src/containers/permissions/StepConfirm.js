/*
 * @flow
 */

import React from 'react';

import { Typography } from 'lattice-ui-kit';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import { BasicErrorComponent, StackGrid } from '../../components';

const StepConfirm = ({
  assignPermissionsRS,
  confirmText
} :{
  assignPermissionsRS :?RequestState;
  confirmText :string;
}) => (
  <StackGrid>
    {
      assignPermissionsRS === RequestStates.STANDBY && (
        <Typography>
          {confirmText}
        </Typography>
      )
    }
    {
      assignPermissionsRS === RequestStates.SUCCESS && (
        <Typography>Success!</Typography>
      )
    }
    {
      assignPermissionsRS === RequestStates.FAILURE && (
        <BasicErrorComponent />
      )
    }
  </StackGrid>
);

export default StepConfirm;
