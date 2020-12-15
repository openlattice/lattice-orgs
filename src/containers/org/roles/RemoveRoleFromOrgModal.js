// @flow
import React from 'react';

import { Modal } from 'lattice-ui-kit';
import { useDispatch } from 'react-redux';
import type { UUID } from 'lattice';

import ResetOnUnmount from '../components/ResetOnUnmount';
import { REMOVE_ROLE_FROM_ORGANIZATION, removeRoleFromOrganization } from '../actions';


const resetStatePath = [REMOVE_ROLE_FROM_ORGANIZATION];

type Props = {
  isVisible :boolean;
  onClose :() => void;
  organizationId :UUID;
  roleId :UUID;
};

const RemoveRoleFromOrgModal = ({
  isVisible,
  onClose,
  organizationId,
  roleId
} :Props) => {
  const dispatch = useDispatch();

  const handleOnClickPrimary = () => {
    dispatch(
      removeRoleFromOrganization({
        organizationId,
        roleId,
      })
    );
  };

  return (
    <Modal
        isVisible={isVisible}
        textPrimary="Delete"
        onClickPrimary={handleOnClickPrimary}
        onClose={onClose}
        textTitle="Delete Role">
      <ResetOnUnmount
          path={resetStatePath}
          message="Are you sure you want to delete this role? This action cannot be undone." />
    </Modal>
  );
};

export default RemoveRoleFromOrgModal;
