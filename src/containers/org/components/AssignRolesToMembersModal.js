// @flow

import React, { useState } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { Modal, ModalFooter } from 'lattice-ui-kit';
import type { Role } from 'lattice';

import SelectRoles from './SelectRoles';

import { ModalBody, StepsController } from '../../../components';

const StyledFooter = styled(ModalFooter)`
  padding: 16px 0 30px;
`;

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

  const handleSelectRole = (role :Role) => {
    const { id } = role;
    const newSelection = selectedRoles.has(id)
      ? selectedRoles.remove(id)
      : selectedRoles.set(id, role);
    setSelectedRoles(newSelection);
  };

  const handleSave = () => {

  };

  return (
    <Modal
        isVisible={isVisible}
        onClose={onClose}
        shouldCloseOnOutsideClick={false}
        textTitle="Add Roles"
        withFooter={false}>
      <StepsController>
        {
          ({ step, stepBack, stepNext }) => (
            <>
              {
                step === 0 && (
                  <>
                    <ModalBody>
                      <SelectRoles
                          members={members}
                          onClick={handleSelectRole}
                          roles={roles}
                          selectedRoles={selectedRoles} />
                    </ModalBody>
                    <StyledFooter
                        isDisabledPrimary={!selectedRoles.size}
                        onClickPrimary={stepNext}
                        shouldStretchButtons
                        textPrimary="Continue" />
                  </>
                )
              }
              {
                step === 1 && (
                  <>
                    <ModalBody>
                      <div>confirm</div>
                    </ModalBody>
                    <StyledFooter
                        onClickPrimary={handleSave}
                        onClickSecondary={stepBack}
                        shouldStretchButtons
                        textPrimary="Save"
                        textSecondary="Back" />
                  </>
                )
              }
            </>
          )
        }
      </StepsController>
    </Modal>
  );
};

export default AssignRolesToMembersModal;
