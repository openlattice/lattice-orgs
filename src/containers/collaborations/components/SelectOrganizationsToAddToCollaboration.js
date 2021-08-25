/*
 * @flow
 */

import React from 'react';

import { Label, Select } from 'lattice-ui-kit';
import type { UUID } from 'lattice';

import { ModalBody, StackGrid } from '../../../components';

const SelectOrganizationsToAddToCollaboration = ({
  options,
  setCollaborationOrganizations
} :{
  options :Object[];
  setCollaborationOrganizations :(orgIds :UUID[]) => void;
}) => {

  const handleOnChange = (orgOptions :Object[]) => {
    const orgIds :UUID[] = orgOptions.map((org) => org.value);
    setCollaborationOrganizations(orgIds);
  };

  const modalText = options.length
    ? 'Select organizations to add to collaboration.'
    : 'There are no eligible organizations to add to this collaboration.';

  return (
    <ModalBody>
      <StackGrid>
        <Label htmlFor="add-organizations-to-collabroation">{modalText}</Label>
        <Select
            id="add-organizations-to-collabroation"
            isDisabled={!options.length}
            isMulti
            menuPortalTarget={document.body}
            styles={{ menuPortal: (provided) => ({ ...provided, zIndex: 9999 }) }}
            onChange={handleOnChange}
            options={options}
            placeholder="select organizations" />
      </StackGrid>
    </ModalBody>
  );
};

export default SelectOrganizationsToAddToCollaboration;
