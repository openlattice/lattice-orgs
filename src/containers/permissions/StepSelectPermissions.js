/*
 * @flow
 */

import React from 'react';

import _capitalize from 'lodash/capitalize';
import { faToggleOn } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Types } from 'lattice';
import {
  Colors,
  IconButton,
  Select,
  Typography
} from 'lattice-ui-kit';
import type { PermissionType } from 'lattice';

import { SpaceBetweenGrid, StackGrid } from '../../components';
import type { ReactSelectOption } from '../../types';

const { PermissionTypes } = Types;
const { NEUTRAL, PURPLE } = Colors;

const PERMISSIONS_OPTIONS = [
  { label: _capitalize(PermissionTypes.OWNER), value: PermissionTypes.OWNER },
  { label: _capitalize(PermissionTypes.READ), value: PermissionTypes.READ },
  { label: _capitalize(PermissionTypes.WRITE), value: PermissionTypes.WRITE },
  { label: _capitalize(PermissionTypes.LINK), value: PermissionTypes.LINK },
  { label: _capitalize(PermissionTypes.MATERIALIZE), value: PermissionTypes.MATERIALIZE },
];

const StepSelectPermissions = ({
  assignPermissionsToAllProperties,
  isDataSet,
  setAssignPermissionsToAllProperties,
  setTargetPermissionOptions,
  targetTitle,
  targetPermissionOptions,
} :{
  assignPermissionsToAllProperties :boolean;
  isDataSet :?boolean;
  setAssignPermissionsToAllProperties :(permissionsOnAllProperties :boolean) => void;
  setTargetPermissionOptions :(permissionTypes :ReactSelectOption<PermissionType>[]) => void;
  targetTitle :string;
  targetPermissionOptions :ReactSelectOption<PermissionType>[];
}) => {

  const permissions = targetPermissionOptions
    .map((option) => option.value)
    .map(_capitalize)
    .join(', ');

  const handleOnChange = (options :?ReactSelectOption<PermissionType>[]) => {
    if (!options) {
      setTargetPermissionOptions([]);
    }
    else {
      setTargetPermissionOptions(options);
    }
  };

  return (
    <StackGrid>
      <Typography>
        {`Select permissions to assign to "${targetTitle}".`}
      </Typography>
      <Select
          isMulti
          onChange={handleOnChange}
          options={PERMISSIONS_OPTIONS}
          value={targetPermissionOptions} />
      {
        isDataSet && (
          <>
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
          </>
        )
      }
    </StackGrid>
  );
};

export default StepSelectPermissions;
