/*
 * @flow
 */

import React from 'react';

import _capitalize from 'lodash/capitalize';
import { Types } from 'lattice';
import { Select, Typography } from 'lattice-ui-kit';
import type { PermissionType } from 'lattice';

import { StackGrid } from '../../../../components';
import type { ReactSelectOption } from '../../../../types';

const { PermissionTypes } = Types;

const PERMISSIONS_OPTIONS = [
  { label: _capitalize(PermissionTypes.OWNER), value: PermissionTypes.OWNER },
  { label: _capitalize(PermissionTypes.READ), value: PermissionTypes.READ },
  { label: _capitalize(PermissionTypes.WRITE), value: PermissionTypes.WRITE },
  { label: _capitalize(PermissionTypes.LINK), value: PermissionTypes.LINK },
  { label: _capitalize(PermissionTypes.MATERIALIZE), value: PermissionTypes.MATERIALIZE },
];

const StepSelectPermissions = ({
  setTargetPermissionOptions,
  targetDataSetTitle,
  targetPermissionOptions,
} :{
  setTargetPermissionOptions :(permissionTypes :ReactSelectOption<PermissionType>[]) => void;
  targetDataSetTitle :string;
  targetPermissionOptions :ReactSelectOption<PermissionType>[];
}) => {

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
        {`Select permissions to assign to "${targetDataSetTitle}".`}
      </Typography>
      <Select
          isMulti
          onChange={handleOnChange}
          options={PERMISSIONS_OPTIONS}
          value={targetPermissionOptions} />
    </StackGrid>
  );
};

export default StepSelectPermissions;
