/*
 * @flow
 */

import React from 'react';

import _capitalize from 'lodash/capitalize';
import { Typography } from 'lattice-ui-kit';
import { RequestStates } from 'redux-reqseq';
import type { PermissionType } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { BasicErrorComponent, StackGrid } from '../../../../components';
import type { ReactSelectOption } from '../../../../types';

const StepConfirm = ({
  assignPermissionsToAllProperties,
  assignPermissionsToDataSetRS,
  targetDataSetTitle,
  targetPermissionOptions,
} :{
  assignPermissionsToAllProperties :boolean;
  assignPermissionsToDataSetRS :?RequestState;
  targetDataSetTitle :string;
  targetPermissionOptions :ReactSelectOption<PermissionType>[];
}) => {

  const permissions = targetPermissionOptions
    .map((option) => option.value)
    .map(_capitalize)
    .join(', ');

  const confirmText = assignPermissionsToAllProperties
    ? `Please confirm you want to assign ${permissions} to "${targetDataSetTitle}" and all its properties.`
    : `Please confirm you want to assign ${permissions} to "${targetDataSetTitle}".`;

  return (
    <StackGrid>
      {
        assignPermissionsToDataSetRS === RequestStates.STANDBY && (
          <Typography>
            {confirmText}
          </Typography>
        )
      }
      {
        assignPermissionsToDataSetRS === RequestStates.SUCCESS && (
          <Typography>Success!</Typography>
        )
      }
      {
        assignPermissionsToDataSetRS === RequestStates.FAILURE && (
          <BasicErrorComponent />
        )
      }
    </StackGrid>
  );
};

export default StepConfirm;
