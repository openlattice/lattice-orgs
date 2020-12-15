/*
 * @flow
 */

import React from 'react';

import _capitalize from 'lodash/capitalize';
import { faToggleOn } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Colors, IconButton, Typography } from 'lattice-ui-kit';
import type { PermissionType } from 'lattice';

import { SpaceBetweenGrid, StackGrid } from '../../../../components';
import type { ReactSelectOption } from '../../../../types';

const { NEUTRAL, PURPLE } = Colors;

const StepSelectProperties = ({
  assignPermissionsToAllProperties,
  setAssignPermissionsToAllProperties,
  targetDataSetTitle,
  targetPermissionOptions,
} :{
  assignPermissionsToAllProperties :boolean;
  setAssignPermissionsToAllProperties :(all :boolean) => void;
  targetDataSetTitle :string;
  targetPermissionOptions :ReactSelectOption<PermissionType>[];
}) => {

  const permissions = targetPermissionOptions
    .map((option) => option.value)
    .map(_capitalize)
    .join(', ');

  return (
    <StackGrid>
      <Typography>
        {`You have selected to assign ${permissions} to "${targetDataSetTitle}".`}
      </Typography>
      <Typography>
        You can assign permissions to either the data set and all properties, or just the data set itself.
        Permissions on individual properties can be assigned later.
      </Typography>
      <SpaceBetweenGrid>
        <Typography variant="body1">
          {`Assign ${permissions} to all properties:`}
        </Typography>
        <IconButton
            aria-label="permissions toggle for all properties"
            onClick={() => setAssignPermissionsToAllProperties(!assignPermissionsToAllProperties)}>
          <FontAwesomeIcon
              color={assignPermissionsToAllProperties ? PURPLE.P300 : NEUTRAL.N500}
              fixedWidth
              icon={faToggleOn}
              transform={{ rotate: assignPermissionsToAllProperties ? 0 : 180 }}
              size="lg" />
        </IconButton>
      </SpaceBetweenGrid>
    </StackGrid>
  );
};

export default StepSelectProperties;
