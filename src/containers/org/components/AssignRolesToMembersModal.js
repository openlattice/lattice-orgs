// @flow

import React, { useState } from 'react';

import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import type { Role } from 'lattice';

import SelectRoles from './SelectRoles';

import { StepsController } from '../../../components';

type Props = {
  isVisible :boolean;
  onClose :() => void;
  members :Map[];
  roles :Role[];
};

const AssignRolesToMembersModal = ({
  isVisible,
  onClose,
  members,
  roles,
} :Props) => {

  const [selectedRoles, setSelectedRoles] = useState(Map());

  return (
    <Modal
        isVisible={isVisible}
        onClose={onClose}
        shouldCloseOnOutsideClick={false}
        textTitle="Add Roles"
        viewportScrolling
        withFooter={false}>
      <StepsController>
        {
          ({ step, stepBack, stepNext }) => (
            <SelectRoles
                roles={roles}
                members={members} />
          )
        }
      </StepsController>
    </Modal>
  );
};

export default AssignRolesToMembersModal;
