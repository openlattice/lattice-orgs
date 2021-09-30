// @flow
import React from 'react';

import { Map } from 'immutable';
import type { Role } from 'lattice';

import SelectRoles from './SelectRoles';
import StyledFooter from './styled/StyledFooter';

import { ModalBody } from '../../../components';

type Props = {
  members :Map;
  onNext :() => void;
  onSelectRole :(role :Role) => void;
  roles :Role[];
  selectedRoles :Map;
}
const BulkRoleSelectionStep = ({
  members,
  onNext,
  onSelectRole,
  roles,
  selectedRoles,
} :Props) => (
  <>
    <ModalBody>
      <SelectRoles
          members={members}
          onClick={onSelectRole}
          roles={roles}
          selectedRoles={selectedRoles} />
    </ModalBody>
    <StyledFooter
        isDisabledPrimary={!selectedRoles.size}
        onClickPrimary={onNext}
        shouldStretchButtons
        textPrimary="Continue" />
  </>
);

export default BulkRoleSelectionStep;
