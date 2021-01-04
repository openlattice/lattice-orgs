/*
 * @flow
 */

import React from 'react';
import type { ComponentType } from 'react';

import _debounce from 'lodash/debounce';
import styled from 'styled-components';
import { CheckboxSelect, SearchInput, Typography } from 'lattice-ui-kit';
import type { PermissionType } from 'lattice';

import { PERMISSION_TYPE_RS_OPTIONS } from './constants';

import { ActionsGrid, PlusButton } from '../../components';
import type { ActionsGridProps } from '../../components';
import type { ReactSelectOption } from '../../types';

const StyledActionsGrid :ComponentType<ActionsGridProps> = styled(ActionsGrid)`
  grid-template-columns: 2fr minmax(200px, 1fr) auto;
`;

const ObjectPermissionsActionsGrid = ({
  onChangeFilterByPermissionTypes,
  onChangeFilterByQuery,
} :{|
  onChangeFilterByPermissionTypes :(permissionTypes :PermissionType[]) => void;
  onChangeFilterByQuery :(query :string) => void;
|}) => {

  const debounceFilterByQuery = _debounce((query :string) => {
    onChangeFilterByQuery(query);
  }, 250);

  const handleOnChangeFilterQuery = (event :SyntheticInputEvent<HTMLInputElement>) => {
    debounceFilterByQuery(event.target.value || '');
  };

  const handleOnChangeSelect = (options :?ReactSelectOption<PermissionType>[]) => {
    if (!options) {
      onChangeFilterByPermissionTypes([]);
    }
    else {
      onChangeFilterByPermissionTypes(options.map((option) => option.value));
    }
  };

  return (
    <StyledActionsGrid>
      <SearchInput onChange={handleOnChangeFilterQuery} />
      <CheckboxSelect
          hideSelectedOptions
          isClearable
          onChange={handleOnChangeSelect}
          options={PERMISSION_TYPE_RS_OPTIONS}
          placeholder="Filter by permission" />
      <PlusButton aria-label="assign permissions" isDisabled>
        <Typography component="span">Assign Permissions</Typography>
      </PlusButton>
    </StyledActionsGrid>
  );
};

export default ObjectPermissionsActionsGrid;
